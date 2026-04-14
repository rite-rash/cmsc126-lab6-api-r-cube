const gallery = document.getElementById('pokemonGallery');
const sidePanel = document.getElementById('side-panel');
let activeFilter = 'all'; 

//
function filterCards() {
const query = document.getElementById('searchInput').value.trim().toLowerCase();
const cards = document.querySelectorAll('.filterDiv');

cards.forEach(card => {
    const data = JSON.parse(card.dataset.pokemon);
    const matchesSearch = data.name.toLowerCase().includes(query) || String(data.id).includes(query);
    const matchesType = activeFilter === 'all' || data.types.includes(activeFilter);

    //show cards only if it matches search keywrod and type of card
    if (matchesSearch && matchesType) { 
        card.classList.add('showCards');
    } else {
        card.classList.remove('showCards');
    }
});
}

// fetch data + create cards
fetch('https://pokeapi.co/api/v2/pokemon?limit=50')  // gets list of pokemons first (name and url only)
    .then(res => res.json())
    .then(data => {
        data.results.forEach(pokemon => {
            fetch(pokemon.url)                      // gets full details for each pokemon
                .then(res => res.json())
                .then(details => {
                    // variables
                    const name = details.name;
                    const id = details.id;
                    const types = details.types.map(t => t.type.name);
                    const abilities = details.abilities.map(a => a.ability.name);
                    const sprite = details.sprites.front_default;
                    
                    // create card
                    const card = document.createElement('div');
                    card.classList.add('filterDiv', 'showCards');
                    
                    card.innerHTML = `
                        <span class="pokemon-id">#${String(id).padStart(3, '0')}</span>
                        <img class="pokemon-sprite-front" src="${sprite}" alt="${name}" />
                        <h3>${name}</h3>

                        <div class="type-container">
                            ${types.map(type => 
                                `<span class="type-badge ${type}">${type}</span>`
                            ).join('')}
                        </div>
                    `;
                    
                    // store full data for side panel
                    card.dataset.pokemon = JSON.stringify({
                        id, name, types, abilities, sprite
                    });

                    gallery.appendChild(card);
                    console.log(id, name, types, abilities, sprite);
                });
        });
    });

// event listener
gallery.addEventListener('click', (e) => {
    const card = e.target.closest('.filterDiv');
    if (!card) return;

    const data = JSON.parse(card.dataset.pokemon);

    document.getElementById('side-id').textContent = `#${String(data.id).padStart(3, '0')}`;
    document.getElementById('side-name').textContent = data.name;
    document.getElementById('side-sprite-front').src = data.sprite;
    
    document.getElementById('side-types').innerHTML = 
        data.types.map(t => `<span class="type-badge">${t}</span>`).join('');
    
    document.getElementById('side-abilities').innerHTML = 
        data.abilities.map(a => `<li>${a}</li>`).join('');
    
    sidePanel.classList.add('active');

});

    // category filter buttons
    document.querySelectorAll('.filter-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-option-btn.active').classList.remove('active');
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            filterCards();
        });
    });

    // search on submit
    document.getElementById('filterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        filterCards();
    });

    // search live 
    document.getElementById('searchInput').addEventListener('input', () => {
        filterCards();
    });

const gallery = document.getElementById('pokemonGallery');
const sidePanel = document.getElementById('side-panel');
let activeFilter = 'all'; 

//
function searchCards() {
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

const typeSelect = document.getElementById('type');
const abiSelect = document.getElementById('abilities');
const genSelect = document.getElementById('generation');

const typesList = new Set();
const genList = new Set();
const abiList = new Set();

// function to add options for filter
function createOptions(selectElement, dataSet, label){
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `All ${label}`;
    selectElement.append(defaultOption);

    dataSet.forEach(item => {
        const option = document.createElement('option');
        option.value = item;

        // cleaner label for generation
        if (label === "Generations") {
            option.textContent = item.replace("generation-", "Gen ");
        } else {
            option.textContent = item;
        }
        selectElement.append(option);
    });
}

// fetch data + create cards
fetch('https://pokeapi.co/api/v2/pokemon?limit=15')  // gets list of pokemons first (name and url only)
    .then(res => res.json())
    .then(data => {

        const promises = data.results.map(pokemon =>
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
                    card.classList.add('filterDiv', 'showCards'); // adds class to div element card
                            
                    // store type, abilities, gen
                    types.forEach(type => typesList.add(type))
                    console.log("typesList: ", typesList);
                    
                    abilities.forEach(ability => abiList.add(ability))
                    console.log("abiList: ", abiList);

                    // fetch generation
                    return fetch(details.species.url)
                        .then(res => res.json())
                        .then(species => {
                            const gen = species.generation.name;
                            genList.add(gen);

                            // build card UI
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
                    
                            // store full data for side panel and filtering
                            card.dataset.pokemon = JSON.stringify({
                                id, name, types, abilities, gen, sprite
                            });

                            gallery.appendChild(card);
                            console.log(id, name, types, abilities, gen,sprite);
                        });
                })
        );

        // wait for ALL fetches to finish
        Promise.all(promises).then(() => {
            createOptions(typeSelect, typesList, "Types");
            createOptions(abiSelect, abiList, "Abilities");
            createOptions(genSelect, genList, "Generations");
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
            searchCards();
        });
    });

    // search on submit
    document.getElementById('filterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        searchCards();
    });

    // search live 
    document.getElementById('searchInput').addEventListener('input', () => {
        searchCards();
    });

typeSelect.addEventListener('change', filterCards);
abiSelect.addEventListener('change', filterCards);
genSelect.addEventListener('change', filterCards);

function filterCards(){
    console.log("FILTER RUNNING");
    console.log(typeSelect.value, abiSelect.value, genSelect.value);

    const selectedType = typeSelect.value;
    const selectedAbi = abiSelect.value;
    const selectedGen = genSelect.value;

    const cards = document.querySelectorAll('.filterDiv');

    cards.forEach(card => {
        const data = JSON.parse(card.dataset.pokemon);

        const matchType = !selectedType || data.types.includes(selectedType);
        const matchAbility = !selectedAbi || data.abilities.includes(selectedAbi);
        const matchGen = !selectedGen || data.gen === selectedGen;
        
        card.classList.remove('showCards');    // clear

        if (matchType && matchAbility && matchGen) {
            card.classList.add('showCards');   // show
        } 
        console.log(card.classList);
    });

}

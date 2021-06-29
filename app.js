//Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors; //array

//this is for local storage
let savedPalettes = []; //array of objects

//Add event listener
generateBtn.addEventListener('click', randomColors);

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipBoard(hex);
    })
});

adjustBtn.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});

//change icon on click and add the class 'locked'
lockBtn.forEach((item, index) => {
  item.addEventListener("click", () => {
    item.children[0].classList.toggle("fa-lock-open");

    item.children[0].classList.toggle("fa-lock");
    colorDivs[index].classList.toggle("locked");
  });
});

//remove popups 
window.addEventListener("click", (e) => {
    const popupBox = popup.children[0];
    e.target === popup ? popup.classList.remove("active") : false

    if (e.target === popup) {
        popup.classList.remove("active");
        popupBox.classList.remove('active');
    } else {
        return false;
    }
});

// popup.addEventListener('transitionend', () => {
//     const popupBox = popup.children[0];
//     popup.classList.remove("active");
//     popupBox.classList.remove('active');
// });



//Functions 
//Color generator
function generateHex() {
    // const letters = "0123456789ABCDEF";
    // let hash = '#';
    // for (let i = 0; i < 6; i++) {
    //     hash += letters[Math.floor(Math.random() * 16)];
    // }

    // return hash;
    const hexColor = chroma.random(); //chromajs library func
    return hexColor;
}

function randomColors () {
    //Initial colors 
    initialColors = [];

    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        const icons = colorDivs[index].querySelectorAll('.controls button');
        
        // add to the colors array and keep the color if its locked
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }

        initialColors.push(chroma(randomColor).hex());

        //check contrast
        checkTextContrast(randomColor, hexText);
        //check contrast for icons
        for (icon of icons) {
            checkTextContrast(randomColor, icon);
        }

        //Add the color to the background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        

        
        //initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });

    resetInputs();
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > .5) {
        text.style.color = 'black';
    } else {
        text.style.color = 'white';
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    //scale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    //scale brighness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);

    // update input color
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;


    //set to its right value
    hue.value = color.hsl()[0];
    saturation.value = color.hsl()[1];
    brightness.value = color.hsl()[2];
   

}

function hslControls(e) {
    const index = 
        e.target.getAttribute('data-bright') || 
        e.target.getAttribute('data-hue') || 
        e.target.getAttribute('data-sat');
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

    console.log(sliders);
    const hue = sliders[0];
    const brighness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];
    // console.log(bgColor);    

    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brighness.value)
        .set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;
    

    //Colorize inputs/sliders


    colorizeSliders(color, hue, brighness, saturation);

}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();

    //check contrast
    checkTextContrast(color, textHex);
    for (icon of icons) {
        checkTextContrast(color, icon);
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider => {
      if (slider.name === "hue") {
        const hueColor = initialColors[slider.getAttribute("data-hue")];
        const hueValue = chroma(hueColor).hsl()[0];
        slider.value = Math.floor(hueValue);
      }
      if (slider.name === "brightness") {
        const brightColor = initialColors[slider.getAttribute("data-bright")];
        const brightValue = chroma(brightColor).hsl()[2];
        slider.value = Math.floor(brightValue * 100) / 100;
      }
      if (slider.name === "saturation") {
        const satColor = initialColors[slider.getAttribute("data-sat")];
        const satValue = chroma(satColor).hsl()[1];
        slider.value = Math.floor(satValue * 100) / 100;
      }

      // sliders are all the input range
        sliders.forEach((slider) => {
            const index =
            slider.getAttribute("data-bright") ||
            slider.getAttribute("data-sat") ||
            slider.getAttribute("data-hue");
            // sliderConatiner is the block of slider for each color
            let slidersContainer = slider.parentElement.querySelectorAll(
            'input[type="range"]'
            );
            const hue = slidersContainer[0];
            const brightness = slidersContainer[1];
            const saturation = slidersContainer[2];
    
            const bgColor = initialColors[index];
            let color = chroma(bgColor)
            .set("hsl.s", saturation.value)
            .set("hsl.l", brightness.value)
            .set("hsl.h", hue.value);
    
            // update sliders background upon changing color
            colorizeSliders(color, hue, brightness, saturation);
        });
    });
}

function copyToClipBoard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    //popup animation
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
    sliderContainers[index].children[0].addEventListener("click", (e) => {
        sliderContainers[index].classList.remove("active");
    });
}

//Implement save to palette and LOCAL STORAGE STUFF
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

//Event listener
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e) {
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    //generate object
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if (paletteObjects) {
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;
    }

    const paletteObj = {name, colors, nr: paletteNr};
    savedPalettes.push(paletteObj);

    //save to local storage
    saveToLocal(paletteObj);
    saveInput.value = '';

    //generate palette for library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = 'Select';

    // const paletteDelBtn = document.createElement('button');
    // paletteDelBtn.classList.add('delete');
    // paletteDelBtn.classList.add(paletteObj.nr);
    // paletteDelBtn.innerText = 'Delete';

    //attach event to the button
    paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);

        });

        resetInputs();

    });


    //append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    // palette.appendChild(paletteDelBtn);
    
    libraryContainer.children[0].appendChild(palette);

}

function saveToLocal(palleteObj) {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }

    localPalettes.push(palleteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal() {
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
            //generate palette for library
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });

            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = 'Select';

            //attach event to the button
            paletteBtn.addEventListener('click', e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUI(index);

                });

                resetInputs();

            });


            //append to library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }

}

// localStorage.clear();


getLocal();
randomColors();


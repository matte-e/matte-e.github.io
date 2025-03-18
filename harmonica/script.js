document.addEventListener('DOMContentLoaded', () => {

    const INTERVAL_NAMES = ['PO', 'm2', 'MJ2', 'm3', 'MJ3', 'P4', 'A4_D5', 'P5', 'm6', 'MJ6', 'm7', 'MJ7'];

    const RICHTER_TUNING = [
        [0, 2],
        [4, 7],
        [7, 11],
        [12, 14],
        [16, 17],
        [19, 21],
        [24, 23],
        [28, 26],
        [31, 29],
        [36, 33],
    ];

    function createFullTuning(tuning) {
        // add base and bend notes
        const result = tuning.map(([blow, draw]) => {
            const blows = [blow];
            const draws = [draw];
            for(let bend = blow - 1; bend > draw; bend--) {
                blows.push(bend);
            }
            for(let bend = draw - 1; bend > blow; bend--) {
                draws.push(bend);
            }
            return {blows, draws};
        });
        // collect all notes so far
        const allNotes = new Set();
        const addNote = note => allNotes.add(note);
        result.forEach(({blows, draws}) => {
            blows.forEach(addNote);
            draws.forEach(addNote);
        });
        // add missing overblow notes
        result.forEach(({blows, draws}) => {
            const addOverblow = (higher, lower) => {
                if(lower[0] < higher[0]) {
                    const overblow = higher[0] + 1;
                    if(!allNotes.has(overblow)) {
                        lower.push(overblow);
                    }
                }
            };
            addOverblow(blows, draws);
            addOverblow(draws, blows);
        });
        return result;
    };

    function createTuningMap(fullTuning) {
        const result = {};
        const append = (sign, hole) => (steps, bend) => {
            const id = sign + (hole + 1) + "'".repeat(bend);
            result[id] = steps;
        };
        fullTuning.forEach(({blows, draws}, hole) => {
            blows.forEach(append('+', hole));
            draws.forEach(append('-', hole));
        });
        return result;
    };

    function getLayoutHoles(fullTuning, sign, bend = 0) {
        const result = [];
        fullTuning.forEach(({blows, draws}, idx) => {
            const steps = sign === '+' ? blows : draws;
            if(bend in steps) {
                const id = sign + (idx + 1) + "'".repeat(bend);
                const classes = ["note"];
                if(bend) {
                    const special_class = steps[bend] < steps[0] ? 'bends' : 'overblow';
                    classes.push(special_class);
                }
                result.push({id, idx, classes});
            }
        })
        return result;
    };

    function createDiv(classes, id) {
        const result = document.createElement('div');
        result.id = id;
        result.setAttribute('class', classes);
        return result;
    }

    console.log('Hello World');
    harp_layout = {
        init: () => {
            console.log('Harp Layout');
            var container = document.getElementById('container');
            var options_panel = createDiv('noteRow', 'options');
            var position_options = harp_layout.drawOptions({
                id: 'position',
                label: 'Position:',
                options: harp_layout.positions
            });
            var mode_options = harp_layout.drawOptions({
                id: 'mode',
                label: 'Mode:',
                options: harp_layout.modes
            });
            var temp = harp_layout.chromatic_notes_array;
            temp.push('Interval');
            var keys_option = harp_layout.drawOptions({
                id: 'key',
                label: 'Key:',
                options: temp
            });
            options_panel.appendChild(position_options);
            options_panel.appendChild(mode_options);
            options_panel.appendChild(keys_option);
            container.appendChild(options_panel);
            harp_layout.drawHarp(RICHTER_TUNING);
            const freeRow = createDiv('noteRow');
            freeRow.appendChild(createDiv('square'));
            container.appendChild(freeRow);
            const legend = createDiv('noteRow');
            INTERVAL_NAMES.forEach(interval => {
                const div = createDiv('square note ' + interval);
                div.textContent = interval;
                legend.appendChild(div);
            });
            container.appendChild(legend);
            harp_layout.selectMode(harp_layout.modes[0]);
            harp_layout.selectPosition(harp_layout.positions[0]);
            harp_layout.selectKey('interval');
        },
        findByIdx: (arr, idx) => {
            var obj = arr.find(item => item.idx === idx)
                || null;
            if (obj != null) {
                return createDiv(`square ${obj.classes.join(' ')}`, obj.id);
            }
            return createDiv('square');
        },
        drawHarp: (tuning) => {
            console.log('Draw Harp');
            const fullTuning = createFullTuning(tuning);
            var drawHelper = {
                createHarpContainer: () => {
                    console.log('Create Harp Container');
                    var container = document.getElementById('container');
                    var harpcontainer = createDiv('harpcontainer', 'harpcontainer');
                    container.appendChild(harpcontainer);
                    return harpcontainer;
                },
                drawHoles: (harpcontainer) => {
                    console.log('Draw Hole number');
                    var row = createDiv('noteRow numbers');
                    harpcontainer.appendChild(row);
                    for (var i = 0; i < tuning.length; i++) {
                        var square = createDiv('square hole');
                        square.textContent = i + 1;
                        row.appendChild(square);
                    }
                },
                drawNotes: (sign, bend) => {
                    const rowInfo = getLayoutHoles(fullTuning, sign, bend);
                    var row = createDiv('noteRow');
                    for (var i = 0; i < tuning.length; i++) {
                        var square = harp_layout.findByIdx(rowInfo, i);
                        row.appendChild(square);
                    }
                    return row;
                },
            }
            var harpcontainer = drawHelper.createHarpContainer();
            const maxBlow = Math.max(...fullTuning.map(({blows}) => blows.length));
            const maxDraw = Math.max(...fullTuning.map(({draws}) => draws.length));
            for (let blow = maxBlow - 1; blow >= 0; blow--) {
                harpcontainer.appendChild(drawHelper.drawNotes('+', blow));
            }
            drawHelper.drawHoles(harpcontainer);
            for(let draw = 0; draw < maxDraw; draw++) {
                harpcontainer.appendChild(drawHelper.drawNotes('-', draw));
            }
            return harpcontainer;
        },
        drawOptions: (dropdown_info) => {
            console.log('Draw Options');
            const result = createDiv();
            result.innerHTML = `
                    <label class="dropdown_label" for="${dropdown_info.id}">${dropdown_info.label}</label>
                    <div class="dropdown" id="${dropdown_info.id}">
                        <div id="${dropdown_info.id}" class="dropdown-button" onclick="harp_layout.toggleDropdown_${dropdown_info.id}()"></div>
                        <div class="dropdown-content" id="dropdown-content-${dropdown_info.id}"></div>
                    </div>`;
            return result;
        },
        toggleDropdown_mode: () => {
            const dropdown = document.getElementById(`dropdown-content-mode`);
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            if (dropdown.style.display === 'block') {
                harp_layout.populateDropdown_mode();
            }
        },
        populateDropdown_mode: () => {
            const dropdown = document.getElementById('dropdown-content-mode');
            dropdown.innerHTML = '';
            harp_layout.modes.forEach(mode => {
                const option = document.createElement('div');
                option.innerHTML = `
              <div class="mode-name">${mode.name}</div>
              <div class="mode-interval">${mode.formula.join(', ')}</div>
            `;
                option.onclick = () => harp_layout.selectMode(mode);
                dropdown.appendChild(option);
            });
        },
        selectMode: (mode) => {
            const button = document.getElementById('mode').querySelector('.dropdown-button');
            button.innerHTML = `
              <div class="mode-name">${mode.name}</div>
              <div class="mode-interval" id="selected-mode" data-value=${JSON.stringify(mode.interval)}>${mode.formula.join(', ')}</div>
            `;
            document.getElementById('dropdown-content-mode').style.display = 'none';
            harp_layout.updateDivs();
        },
        toggleDropdown_key: () => {
            const dropdown = document.getElementById(`dropdown-content-key`);
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            if (dropdown.style.display === 'block') {
                harp_layout.populateDropdown_key();
            }
        },
        populateDropdown_key: () => {
            const dropdown = document.getElementById('dropdown-content-key');
            dropdown.innerHTML = '';
            harp_layout.chromatic_notes_array.forEach(note => {
                const option = document.createElement('div');
                option.innerHTML = note;
                option.onclick = () => harp_layout.selectKey(note);
                dropdown.appendChild(option);
            });
        },
        selectKey: (key) => {
            const button = document.getElementById('key').querySelector('.dropdown-button');
            button.innerHTML = key;
            document.getElementById('dropdown-content-key').style.display = 'none';
            harp_layout.updateDivs();
        },
        toggleDropdown_position: () => {
            const dropdown = document.getElementById(`dropdown-content-position`);
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            if (dropdown.style.display === 'block') {
                harp_layout.populateDropdown_position();
            }
        },
        populateDropdown_position: () => {
            const dropdown = document.getElementById('dropdown-content-position');
            dropdown.innerHTML = '';
            harp_layout.positions.forEach(pos => {
                const option = document.createElement('div');
                option.innerHTML = `
                <div class="position-name">${pos.name}</div>
                <div class="position-scales">${pos.scales.join('</br>')}</div>
              `;
                option.onclick = () => harp_layout.selectPosition(pos);
                dropdown.appendChild(option);
            });
        },

        selectPosition: (mode) => {
            const button = document.getElementById('position').querySelector('.dropdown-button');
            button.innerHTML = `
              <div class="position-name">${mode.name}</div>
              <div class="position-scales" id="selected-position" data-value=${mode.id}>${mode.scales.join('</br>')}</div>
            `;
            document.getElementById('dropdown-content-position').style.display = 'none';
            harp_layout.updateDivs();
        },
        updateDivs() {
            const tuningMap = createTuningMap(createFullTuning(RICHTER_TUNING));
            const data = {
                getHarpPosition: function (position, basePositionSteps) {
                    var classes = ['PO', 'm2', 'MJ2', 'm3', 'MJ3', 'P4', 'A4_D5', 'P5', 'm6', 'MJ6', 'm7', 'MJ7'];
                    const steps = (basePositionSteps + 5 * position) % 12;
                    console.log(position, steps, classes[steps]);
                    return classes[steps];
                },//(chromatic_notes_c[note] + half_tone_steps) % 12
                modes: harp_layout.modes,
                getChromaticNoteByHalfToneSteps: function (note, half_tone_steps) {
                    if (note === "Intervals") {
                        return note;
                    }
                    return harp_layout.chromatic_notes_array[(harp_layout.chromatic_notes_c[note] + half_tone_steps) % 12];
                },
                getHarpKey: function (key, position) {
                    return Object.entries(tuningMap)
                    .map(([id, steps]) => ({
                            id,
                            note: this.getChromaticNoteByHalfToneSteps(key, steps),
                            classes: this.getHarpPosition(position, steps)
                    }));
                },
            }
            var position = document.getElementById('selected-position');
            if (position) {
                position = JSON.parse(position.getAttribute('data-value'));
            }
            else {
                position = 0;
            }

            const mode_ = document.getElementById('selected-mode');
            var mode = JSON.parse(mode_.getAttribute('data-value'));
            const key = document.getElementById('key').querySelector('.dropdown-button').innerText;

            console.log('position', position);
            console.log('mode', mode);
            console.log('key', key);

            // Clear previous intervals
            console.log('clearing intervals');
            document.getElementById('harpcontainer').querySelectorAll('.square').forEach(div => {
                div.classList.remove('PO', 'm2', 'MJ2', 'm3', 'MJ3', 'P4', 'A4_D5', 'P5', 'm6', 'MJ6', 'm7', 'MJ7', 'highlight');
            });
            //select key
            console.log('selecting key');
            data.getHarpKey(key, position).forEach(note => {
                console.log('note', note);
                var curr = document.getElementById(note.id);
                curr.innerText = note.note || note.classes;
                curr.classList.add(note.classes);
            });
            console.log(mode);
            // console.log(JSON.parse(mode));

            harp_layout.updateHighlight(mode);
            console.log('done');
        },
        updateHighlight: (notes) => {
            // Clear previous highlights
            console.log('clearing highlights');
            document.querySelectorAll('.highlight').forEach(div => {
                div.classList.remove('highlight');
            });
            if (notes) {
                console.log(notes);
                notes.forEach(className => {
                    var elements = document.querySelectorAll('.' + className);
                    elements.forEach(e =>
                        e.classList.add('highlight')
                    );
                });
            }
        },
        chromatic_notes_array: ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
        chromatic_notes_c: {
            "C": 0,
            "C#": 1,
            "Db": 1,
            "D": 2,
            "D#": 3,
            "Eb": 3,
            "E": 4,
            "F": 5,
            "F#": 6,
            "Gb": 6,
            "G": 7,
            "G#": 8,
            "Ab": 8,
            "A": 9,
            "A#": 10,
            "Bb": 10,
            "B": 11
        },
        positions: [
            {
                "id": "0",
                "name": "First Position",
                "synonyms": ["First Position", "Straight Harp"],
                "scales": ["ionian", "major pentatonic scale", "bebop major scale"]
            },
            {
                "id": "1",
                "name": "Second Position",
                "synonyms": ["Second Position", "Cross Harp"],
                "scales": ["mixolydian", "dominant scale", "blues", "bebop dominant scale", "minor pentatonic scale"]
            },
            {
                "id": "2",
                "name": "Third Position",
                "synonyms": ["Third Position", "Slant Harp"],
                "scales": ["dorian", "melodic minor scale", "harmonic minor scale", "gypsy minor scale", "aeolian", "hungarian minor scale"]
            },
            {
                "id": "3",
                "name": "Fourth Position",
                "synonyms": ["Fourth Position"],
                "scales": ["Aeolian", "double harmonic minor scale"]
            },
            {
                "id": "4",
                "name": "Fifth Position",
                "synonyms": ["Fifth Position"],
                "scales": ["Phrygian", "half whole diminished scale"]
            },
            {
                "id": "5",
                "name": "Sixth Position",
                "synonyms": ["Sixth Position"],
                "scales": ["Locrian", "harmonic major scale"]
            },
            {
                "id": "6",
                "name": "Seventh Position",
                "synonyms": ["Seventh Position"],
                "scales": ["Lydian", "hungarian minor scale", "harmonic minor scale"]
            },
            {
                "id": "7",
                "name": "Eighth Position",
                "synonyms": ["Eighth Position"],
                "scales": ["Mixolydian", "major pentatonic scale"]
            },
            {
                "id": "8",
                "name": "Ninth Position",
                "synonyms": ["Ninth Position"],
                "scales": ["Dorian", "gypsy minor scale"]
            },
            {
                "id": "9",
                "name": "Tenth Position",
                "synonyms": ["Tenth Position"],
                "scales": ["Aeolian", "bebop dominant scale"]
            },
            {
                "id": "10",
                "name": "Eleventh Position",
                "synonyms": ["Eleventh Position"],
                "scales": ["Phrygian", "melodic minor scale"]
            },
            {
                "id": "11",
                "name": "Twelfth Position",
                "synonyms": ["Twelfth Position"],
                "scales": ["ionian", "harmonic major scale"]
            }
            // ,
            // {
            //     "id": "xx",
            //     "name": "No Position",
            //     "synonyms": ["No Position"],
            //     "scales": ["noScale"]
            // }
        ],
        modes: [
            {
                "id": "ionian",
                "name": "Ionian",
                "synonyms": ["Major", "Ionian"],
                "formula": [2, 2, 1, 2, 2, 2, 1],
                "interval": ["PO", "MJ2", "MJ3", "P4", "P5", "MJ6", "MJ7"]
            },
            {
                "id": "dorian",
                "name": "Dorian",
                "synonyms": ["Dorian"],
                "formula": [2, 1, 2, 2, 2, 1, 2],
                "interval": ["PO", "MJ2", "m3", "P4", "P5", "MJ6", "m7"]
            },
            {
                "id": "phrygian",
                "name": "Phrygian",
                "synonyms": ["Phrygian"],
                "formula": [1, 2, 2, 2, 1, 2, 2],
                "interval": ["m2", "m3", "P4", "P5", "m6", "m7", "PO"]
            },
            {
                "id": "lydian",
                "name": "Lydian",
                "synonyms": ["Lydian"],
                "formula": [2, 2, 2, 1, 2, 2, 1],
                "interval": ["MJ2", "MJ3", "A4_D5", "P5", "MJ6", "MJ7", "PO"]
            },
            {
                "id": "mixolydian",
                "name": "Mixolydian",
                "synonyms": ["Mixolydian"],
                "formula": [2, 2, 1, 2, 2, 1, 2],
                "interval": ["MJ2", "MJ3", "P4", "P5", "MJ6", "m7", "PO"]
            },
            {
                "id": "aeolian",
                "name": "Aeolian",
                "synonyms": ["Aeolian"],
                "formula": [2, 1, 2, 2, 1, 2, 2],
                "interval": ["PO", "MJ2", "m3", "P4", "P5", "m6", "m7"]
            },
            {
                "id": "locrian",
                "name": "Locrian",
                "synonyms": ["Locrian"],
                "formula": [1, 2, 2, 1, 2, 2, 2],
                "interval": ["m2", "m3", "P4", "A4_D5", "m6", "m7", "PO"]
            },
            {
                "id": "blues",
                "name": "Blues",
                "synonyms": ["Blues"],
                "formula": [3, 2, 1, 1, 3, 2],
                "interval": ["PO", "m3", "P4", "A4_D5", "P5", "m7"]
            },
            {
                "id": "noScale",
                "name": "No Scale",
                "synonyms": ["No Scale"],
                "formula": [],
                "interval": []
            },
            {
                "id": "chromatic_scale",
                "name": "Chromatic",
                "synonyms": ["Chromatic"],
                "formula": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                "interval": ["PO", "m2", "MJ2", "m3", "MJ3", "P4", "A4_D5", "P5", "m6", "MJ6", "m7", "MJ7"]
            },
            {
                "id": "bebop_dominant_scale",
                "name": "Bebop Dominant",
                "synonyms": ["Bebop Dominant"],
                "formula": [2, 2, 1, 2, 1, 1, 1, 2],
                "interval": ["PO", "MJ2", "MJ3", "P4", "P5", "MJ6", "m7", "PO"]
            },
            {
                "id": "bebop_major_scale",
                "name": "Bebop Major",
                "synonyms": ["Bebop Major"],
                "formula": [2, 2, 1, 2, 1, 1, 2, 1],
                "interval": ["PO", "MJ2", "MJ3", "P4", "P5", "MJ6", "MJ7", "PO"]
            },
            {
                "id": "dominant_scale",
                "name": "Dominant",
                "synonyms": ["Dominant"],
                "formula": [2, 2, 1, 2, 2, 1, 2],
                "interval": ["PO", "MJ2", "MJ3", "P4", "P5", "MJ6", "m7", "PO"]
            },
            {
                "id": "double_harmonic_minor_scale",
                "name": "Double Harmonic Minor",
                "synonyms": ["Double Harmonic Minor"],
                "formula": [1, 3, 1, 2, 1, 3, 1],
                "interval": ["PO", "m2", "m3", "P4", "A4_D5", "m6", "m7", "PO"]
            },
            {
                "id": "gypsy_minor_scale",
                "name": "Gypsy Minor",
                "synonyms": ["Gypsy Minor"],
                "formula": [1, 3, 1, 2, 1, 3, 1],
                "interval": ["PO", "m2", "m3", "P4", "A4_D5", "m6", "m7", "PO"]
            },
            {
                "id": "half_whole_diminished_scale",
                "name": "Half-Whole Diminished",
                "synonyms": ["Half-Whole Diminished"],
                "formula": [1, 2, 1, 2, 1, 2, 1, 2],
                "interval": ["PO", "m2", "m3", "P4", "A4_D5", "m6", "m7", "PO"]
            },
            {
                "id": "harmonic_major_scale",
                "name": "Harmonic Major",
                "synonyms": ["Harmonic Major"],
                "formula": [2, 2, 1, 2, 1, 3, 1],
                "interval": ["PO", "MJ2", "MJ3", "P4", "P5", "m6", "m7", "PO"]
            },
            {
                "id": "harmonic_minor_scale",
                "name": "Harmonic Minor",
                "synonyms": ["Harmonic Minor"],
                "formula": [2, 1, 2, 2, 1, 3, 1],
                "interval": ["PO", "MJ2", "m3", "P4", "P5", "m6", "m7", "PO"]
            },
            {
                "id": "hungarian_minor_scale",
                "name": "Hungarian Minor",
                "synonyms": ["Hungarian Minor"],
                "formula": [2, 1, 3, 1, 1, 3, 1],
                "interval": ["PO", "MJ2", "m3", "P4", "A4_D5", "m6", "m7", "PO"]
            },
            {
                "id": "major_pentatonic_scale",
                "name": "Major Pentatonic",
                "synonyms": ["Major Pentatonic"],
                "formula": [2, 2, 3, 2, 3],
                "interval": ["PO", "MJ2", "MJ3", "P5", "MJ6", "PO"]
            },
            {
                "id": "melodic_minor_scale",
                "name": "Melodic Minor",
                "synonyms": ["Melodic Minor"],
                "formula": [2, 1, 2, 2, 2, 2, 1],
                "interval": ["PO", "MJ2", "m3", "P4", "P5", "MJ6", "MJ7", "PO"]
            },
            {
                "id": "minor_pentatonic_scale",
                "name": "Minor Pentatonic",
                "synonyms": ["Minor Pentatonic"],
                "formula": [3, 2, 2, 3, 2],
                "interval": ["PO", "m3", "P4", "P5", "m7", "PO"]
            }
        ]
    };
    harp_layout.init();
});
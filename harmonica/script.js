document.addEventListener('DOMContentLoaded', () => {
    console.log('Hello World');
    harp_layout = {
        init: () => {
            console.log('Harp Layout');
            var container = document.getElementById('container');
            var options_panel = harp_layout.htmlToNodes('<div id="options" class="noteRow"></div>')[0];
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
            harp_layout.drawHarp();
            var legend = harp_layout.htmlToNodes(`<div class="noteRow">
                <div class="square"></div></div>
                <div class="noteRow">
                <div class="square note PO">Root</div>
                <div class="square note m2">m2</div>
                <div class="square note MJ2">M2</div>
                <div class="square note m3">m3</div>
                <div class="square note MJ3">M3</div>
                <div class="square note P4">P4</div>
                <div class="square note A4_D5_tritone">A4/D5</div>
                <div class="square note P5">P5</div>
                <div class="square note m6">m6</div>
                <div class="square note MJ6">M6</div>
                <div class="square note m7">m7</div>
                <div class="square note MJ7">M7</div>
                <div class="square note PO">P8</div>
                </div>`);
            legend.forEach(l => 
                container.appendChild(l));
            harp_layout.selectMode(harp_layout.modes[0]);
            harp_layout.selectPosition(harp_layout.positions[0]);
            harp_layout.selectKey('interval');
        },
        htmlToNodes: (html) => {
            const template = document.createElement('template');
            template.innerHTML = html;
            return template.content.childNodes;
        },
        findByIdx: (arr, idx) => {
            var obj = arr.find(item => item.idx === idx)
                || null;
            if (obj != null) {
                return harp_layout.htmlToNodes(`<div id="${obj.id}" class="square ${obj.classes.join(' ')}"></div>`)[0]
            }
            return harp_layout.htmlToNodes('<div class="square"></div>')[0]
        },
        drawHarp: () => {
            console.log('Draw Harp');
            var drawHelper = {
                createHarpContainer: () => {
                    console.log('Create Harp Container');
                    var container = document.getElementById('container');
                    var harpcontainer = harp_layout
                        .htmlToNodes('<div id="harpcontainer" class="harpcontainer"></div>')[0];
                    container.appendChild(harpcontainer);
                    return harpcontainer;
                },
                drawHoles: (harpcontainer) => {
                    console.log('Draw Hole number');
                    var row = harp_layout
                        .htmlToNodes('<div class="noteRow numbers"></div>')[0];
                    harpcontainer.appendChild(row);
                    for (var i = 0; i < 10; i++) {
                        var square = harp_layout
                            .htmlToNodes(`<div class="square hole">${i + 1}</div>`)[0];
                        row.appendChild(square);
                    }
                },
                drawNotes: (div, rowInfo) => {
                    var row = harp_layout
                        .htmlToNodes(div)[0];
                    drawHelper.fillRow(row, rowInfo);
                    return row;
                },
                fillRow: (row, rowInfo) => {
                    console.log('Fill Row');
                    for (var i = 0; i < 10; i++) {
                        var square = harp_layout.findByIdx(rowInfo, i);
                        row.appendChild(square);
                    }

                }
            }
            var harpcontainer = drawHelper.createHarpContainer();
            harpcontainer.appendChild(drawHelper.drawNotes('<div class="noteRow overblowWS"/>', harp_layout.layout.WSoverblow));
            harpcontainer.appendChild(drawHelper.drawNotes('<div class="noteRow overblowHS"/>', harp_layout.layout.HSoverblow));
            harpcontainer.appendChild(drawHelper.drawNotes('<div class="noteRow blownotes"/>', harp_layout.layout.BlowNotes));
            drawHelper.drawHoles(harpcontainer);
            harpcontainer.appendChild(drawHelper.drawNotes('<div class="noteRow drawnotes"/>', harp_layout.layout.DrawNotes));
            harpcontainer.appendChild(drawHelper.drawNotes('<div class="noteRow bendHS"/>', harp_layout.layout.HSBendNotes));
            harpcontainer.appendChild(drawHelper.drawNotes('<div class="noteRow bendWS"/>', harp_layout.layout.WSBendNotes));
            harpcontainer.appendChild(drawHelper.drawNotes('<div class="noteRow bendWHS"/>', harp_layout.layout.WHSBendNotes));

            
            return harpcontainer;
        },
        drawOptions: (dropdown_info) => {
            console.log('Draw Options');
            return harp_layout.htmlToNodes(
                `<div>
                    <label class="dropdown_label" for="${dropdown_info.id}">${dropdown_info.label}</label>
                    <div class="dropdown" id="${dropdown_info.id}">
                        <div id="${dropdown_info.id}" class="dropdown-button" onclick="harp_layout.toggleDropdown_${dropdown_info.id}()"></div>
                        <div class="dropdown-content" id="dropdown-content-${dropdown_info.id}"></div>
                    </div>
                </div>`)[0];
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
            const data = {
                getHarpPosition: function (position, hole) {
                    var classes = ['PO', 'm2', 'MJ2', 'm3', 'MJ3', 'P4', 'A4_D5_tritone', 'P5', 'm6', 'MJ6', 'm7', 'MJ7'];
                    console.log(position, hole);
                    console.log((harp_layout.richter_tuning_half_tone_steps[hole] + 12 * position - 7 * position) % 12,
                        classes[(harp_layout.richter_tuning_half_tone_steps[hole] + 12 * position - 7 * position) % 12]);
                    return classes[(harp_layout.richter_tuning_half_tone_steps[hole] + 12 * position - 7 * position) % 12];
                },//(chromatic_notes_c[note] + half_tone_steps) % 12
                modes: harp_layout.modes,
                getChromaticNoteByHalfToneSteps: function (note, half_tone_steps) {
                    if (note === "Intervals") {
                        return note;
                    }
                    return harp_layout.chromatic_notes_array[(harp_layout.chromatic_notes_c[note] + half_tone_steps) % 12];
                },
                getHarpKey: function (key, position) {
                    return [
                        {"id":"B1", "note": "+1"},
                        {"id":"Db1", "note": "-1'"},
                        {"id":"D1", "note": "-1"},
                        {"id":"B2", "note": "+2"},
                        {"id":"Dbb2", "note": "-2''"},
                        {"id":"Db2", "note": "-2'"},
                        {"id":"D2", "note": "-2"},
                        {"id":"B3", "note": "+3"},
                        {"id":"Dbbb3", "note": "-3'''"},
                        {"id":"Dbb3", "note": "-3''"},
                        {"id":"Db3", "note": "-3'"},
                        {"id":"D3", "note": "-3"},
                        {"id":"B4", "note": "+4"},
                        {"id":"D4", "note": "-4"},
                        {"id":"B5", "note": "+5"},
                        {"id":"B6", "note": "+6"},
                        {"id":"B7", "note": "+7"},
                        {"id":"B8", "note": "+8"},
                        {"id":"B9", "note": "+9"},
                        {"id":"B10", "note": "+10"},
                        {"id":"D5", "note": "-5"},
                        {"id":"D6", "note": "-6"},
                        {"id":"D7", "note": "-7"},
                        {"id":"D8", "note": "-8"},
                        {"id":"D9", "note": "-9"},
                        {"id":"D10", "note": "-10"},
                        {"id":"Db4", "note": "-4'"},
                        {"id":"Db6", "note": "-6'"},
                        {"id":"Db7", "note": "-7'"},
                        {"id":"Db9", "note": "-9'"},
                        {"id":"Db10", "note": "-10'"},
                        {"id":"Bb1", "note": "+1'"},
                        {"id":"Bb4", "note": "+4'"},
                        {"id":"Bb5", "note": "+5'"},
                        {"id":"Bb6", "note": "+6'"},
                        {"id":"Bb8", "note": "+8'"},
                        {"id":"Bb9", "note": "+9'"},
                        {"id":"Bb10", "note": "+10'"},
                        {"id":"Bbb10", "note": "+10''"},
                    ].map(spec => ({
                            id: spec.id,
                            note: this.getChromaticNoteByHalfToneSteps(key, harp_layout.richter_tuning_half_tone_steps[spec.note]),
                            classes: this.getHarpPosition(position, spec.note)
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
                div.classList.remove('PO', 'm2', 'MJ2', 'm3', 'MJ3', 'P4', 'A4_D5_tritone', 'P5', 'm6', 'MJ6', 'm7', 'MJ7', 'highlight');
            });
            //select key
            console.log('selecting key');
            data.getHarpKey(key, position).forEach(note => {
                console.log('note', note);
                var curr = document.getElementById(note.id);
                if (!note.note) {
                    curr.innerText = note.classes;
                }
                else {
                    curr.innerText = note.note;
                }
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
        layout: {
            WSoverblow: [{
                id: 'Bbb10',
                idx: 9,
                classes: ["note", "bends"]
            }],
            HSoverblow: [
                { id: 'Bb1', idx: 0, classes: ["note", "overblow"] },
                { id: 'Bb4', idx: 3, classes: ["note", "overblow"] },
                { id: 'Bb5', idx: 4, classes: ["note", "overblow"] },
                { id: 'Bb6', idx: 5, classes: ["note", "overblow"] },
                { id: 'Bb8', idx: 7, classes: ["note", "bends"] },
                { id: 'Bb9', idx: 8, classes: ["note", "bends"] },
                { id: 'Bb10', idx: 9, classes: ["note", "bends"] }],
            BlowNotes: [
                { id: 'B1', idx: 0, classes: ["note"] },
                { id: 'B2', idx: 1, classes: ["note"] },
                { id: 'B3', idx: 2, classes: ["note"] },
                { id: 'B4', idx: 3, classes: ["note"] },
                { id: 'B5', idx: 4, classes: ["note"] },
                { id: 'B6', idx: 5, classes: ["note"] },
                { id: 'B7', idx: 6, classes: ["note"] },
                { id: 'B8', idx: 7, classes: ["note"] },
                { id: 'B9', idx: 8, classes: ["note"] },
                { id: 'B10', idx: 9, classes: ["note"] }],
            DrawNotes: [
                { id: 'D1', idx: 0, classes: ["note"] },
                { id: 'D2', idx: 1, classes: ["note"] },
                { id: 'D3', idx: 2, classes: ["note"] },
                { id: 'D4', idx: 3, classes: ["note"] },
                { id: 'D5', idx: 4, classes: ["note"] },
                { id: 'D6', idx: 5, classes: ["note"] },
                { id: 'D7', idx: 6, classes: ["note"] },
                { id: 'D8', idx: 7, classes: ["note"] },
                { id: 'D9', idx: 8, classes: ["note"] },
                { id: 'D10', idx: 9, classes: ["note"] }],
            HSBendNotes: [
                { id: 'Db1', idx: 0, classes: ["note"] },
                { id: 'Db2', idx: 1, classes: ["note"] },
                { id: 'Db3', idx: 2, classes: ["note"] },
                { id: 'Db4', idx: 3, classes: ["note"] },
                { id: 'Db6', idx: 5, classes: ["note"] },
                { id: 'Db7', idx: 6, classes: ["note"] },
                { id: 'Db9', idx: 8, classes: ["note"] },
                { id: 'Db10', idx: 9, classes: ["note"] }],
            WSBendNotes: [
                { id: 'Dbb2', idx: 1, classes: ["note"] },
                { id: 'Dbb3', idx: 2, classes: ["note"] }],
            WHSBendNotes: [
                { id: 'Dbbb3', idx: 2, classes: ["note"] }],
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
        richter_tuning_half_tone_steps: {
            "+1": 0,
            "-1'": 1,
            "-1": 2,
            "+1'": 3,
            "+2": 4,
            "-2'": 6,
            "-2''": 5,
            "-2": 7,
            "+3": 7,
            "-3'''": 8,
            "-3''": 9,
            "-3'": 10,
            "-3": 11,
            "+4": 12,
            "-4'": 13,
            "-4": 14,
            "+4'": 15,
            "+5": 16,
            "-5": 17,
            "+5'": 18,
            "+6": 19,
            "-6'": 20,
            "-6": 21,
            "+6'": 22,
            "-7": 23,
            "+7": 24,
            "-7'": 25,
            "-8": 26,
            "+8'": 27,
            "+8": 28,
            "-9": 29,
            "+9'": 30,
            "+9": 31,
            "-9'": 32,
            "-10": 33,
            "+10": 36,
            "+10'": 35,
            "+10''": 34,
            "-10'": 37
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
                "interval": ["MJ2", "MJ3", "A4_D5_tritone", "P5", "MJ6", "MJ7", "PO"]
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
                "interval": ["m2", "m3", "P4", "A4_D5_tritone", "m6", "m7", "PO"]
            },
            {
                "id": "blues",
                "name": "Blues",
                "synonyms": ["Blues"],
                "formula": [3, 2, 1, 1, 3, 2],
                "interval": ["PO", "m3", "P4", "A4_D5_tritone", "P5", "m7"]
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
                "interval": ["PO", "m2", "MJ2", "m3", "MJ3", "P4", "A4_D5_tritone", "P5", "m6", "MJ6", "m7", "MJ7"]
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
                "interval": ["PO", "m2", "m3", "P4", "A4_D5_tritone", "m6", "m7", "PO"]
            },
            {
                "id": "gypsy_minor_scale",
                "name": "Gypsy Minor",
                "synonyms": ["Gypsy Minor"],
                "formula": [1, 3, 1, 2, 1, 3, 1],
                "interval": ["PO", "m2", "m3", "P4", "A4_D5_tritone", "m6", "m7", "PO"]
            },
            {
                "id": "half_whole_diminished_scale",
                "name": "Half-Whole Diminished",
                "synonyms": ["Half-Whole Diminished"],
                "formula": [1, 2, 1, 2, 1, 2, 1, 2],
                "interval": ["PO", "m2", "m3", "P4", "A4_D5_tritone", "m6", "m7", "PO"]
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
                "interval": ["PO", "MJ2", "m3", "P4", "A4_D5_tritone", "m6", "m7", "PO"]
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
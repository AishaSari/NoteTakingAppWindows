const { ipcRenderer } = require("electron")
let title = document.getElementById("title")
let note = document.getElementById("note")
let saveBtn = document.getElementById("save-btn")
let list = document.getElementById("list")

let notes = [];

function loadNotes() {
    list.innerHTML = "";
    // Sort notes by pinned status (true first) and render them
    const sortedNotes = [...notes].sort((a, b) => b.pinned - a.pinned || b.timestamp - a.timestamp);
    sortedNotes.forEach((note) => {
        const div = document.createElement('div');
        div.classList.add('list_ele');
        if (note.pinned) div.classList.add('pinned');

        const titleElement = document.createElement('h1'); // Title
        titleElement.textContent = note.title;

        const content = document.createElement('p'); // Content
        content.textContent = note.note;

        const deleteButton = document.createElement('button'); // Delete button
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.onclick = () => deleteNote(note._id);

        const pinButton = document.createElement('button'); // Pin button
        pinButton.textContent = note.pinned ? 'Unpin' : 'Pin';
        pinButton.classList.add('pin-btn');
        pinButton.onclick = () => togglePin(note._id);

        div.appendChild(titleElement);
        div.appendChild(content);
        div.appendChild(deleteButton);
        div.appendChild(pinButton);
        list.appendChild(div);
    });
}

window.onload = async () => {
  notes = await ipcRenderer.invoke("get_data")
  loadNotes()
}

saveBtn.onclick = async () => {
    if(title.value !== "" && note.value !=="") {
        let _note = {
            title: title.value,
            note: note.value,
            pinned: false, // Default to not pinned 
            timestamp: Date.now() // Add timestamp for sorting
        }
        
        ipcRenderer.send('save_note', _note) // Save note

        title.value = "";
        note.value = "";

        // Fetch updated notes after saving
        notes = await ipcRenderer.invoke("get_data")
        loadNotes()

    } else {
        window.alert("Please fill all the fields and try again")
    }
}

// Function to delete a note
function deleteNote(id) {
    ipcRenderer.send('delete_note', id); // Send delete command
    notes = notes.filter(note => note._id !== id); // Remove from local array
    loadNotes(); // Refresh view
}

function togglePin(id) {
    // Notify backend to toggle pin
    ipcRenderer.send('toggle_pin', id);

    // Listen for the updated event and refresh the notes
    ipcRenderer.once('pin_updated', async () => {
        notes = await ipcRenderer.invoke("get_data"); // Fetch updated notes
        loadNotes(); // Re-render the notes
    });
}

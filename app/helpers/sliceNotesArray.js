const sliceNotesArray = (data) => {
	const { start, end, count, notes } = data;
	const countNotes = notes.length;
	let targetNotes;
	let indexStartNote = start
		? notes.findIndex(note => note.id === start)
		: -1
	
	let indexEndNote = end
		? notes.findIndex(note => note.id === end)
		: -1
			
	if(indexStartNote > -1 && indexEndNote > -1) {
		targetNotes = notes.slice(indexStartNote, indexEndNote);

		return targetNotes;
	}

	if(indexStartNote > -1 && count) {
		indexEndNote = indexStartNote + count;
		targetNotes = notes.slice(indexStartNote, indexEndNote);

		return targetNotes; 
	}

	if(indexEndNote > -1 && count) {
		indexStartNote = (indexEndNote - count) > -1
			? indexEndNote - count
			: 0
		targetNotes = notes.slice(indexStartNote, indexEndNote);

		return targetNotes;
	}

	if(indexStartNote > -1) {
		targetNotes = notes.slice(indexStartNote);

		return targetNotes;
	}

	if(indexEndNote > -1) {
		targetNotes = note(0, indexEndNote);

		return targetNotes;
	}

	if(count) {
		indexStartNote = count < countNotes
			? countNotes - count
			: 0
		targetNotes = notes.slice(indexStartNote);

		return targetNotes;
	}
		
	return notes;
}

module.exports = sliceNotesArray
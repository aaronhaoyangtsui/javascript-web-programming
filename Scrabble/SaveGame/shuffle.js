'use strict';

function shuffle(array) {
    // Fisher-Yates shuffle, used for random decoder cipher below    
    let m = array.length;
    
    // While there remain elements to shuffle…                                                                                
    while (m) {
	
        // Pick a remaining element…                                                                                          
        const i = Math.floor(Math.random() * m--);
	
        // And swap it with the current element.                                                                              
        const t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    
    return array;
}

export {shuffle};
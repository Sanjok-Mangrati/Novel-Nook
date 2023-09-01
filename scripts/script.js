//Load a book from disk
const loadBook = (filename,displayName) => {
    let currentBook = "";
    let url = "books/" + filename;

    //resetting the UI
    document.getElementById("filename").innerText = displayName;
    document.getElementById("search-stats").innerHTML = "";
    document.getElementById("keyword").value = "";

    //creating a server request to load a book
    let xhr = new XMLHttpRequest();
    //preparing http request
    xhr.open("GET", url, true); //GET request to the url, true means it is asynchronous call
    //sending http request
    xhr.send();

    //when state changes the function fires
    xhr.onreadystatechange = () => {
        //0 means unsent, 1 means file is open, 2 means it recieved headers, 3 means file is loading, 4 means done
        if(xhr.readyState == 4 && xhr.status == 200) {
            currentBook = xhr.responseText;

            //get document stats
            getDocStats(currentBook);
            
            //browers do not understand line breaks in text files so,
            //remove line breaks and carriage returns and replace with <br> so the document is formatted
            currentBook = currentBook.replace(/(?:\r\n|\r|rn)/g, '<br>'); //using regx
            
            //load content
            document.getElementById("file-content").innerHTML = currentBook;


            let element = document.getElementById("file-content");
            element.scrollTop = 0; //when changing books scroll to top of the page
        } 
    }
}

const getDocStats = (fileContent) => {
    let docLength = document.getElementById("docLength");
    let wordCount = document.getElementById("wordCount");

    let text = fileContent.toLowerCase();
    //using match and regx to create an array of words from the whole file content
    let wordArray = text.match(/\b\S+\b/g);
    let wordDictionary = {};

    let uncommonWords = [];

    //filter out the uncommon words
    uncommonWords = filterStopWords(wordArray);


    //Count every word in the wordArray
    for(let wordIndex in uncommonWords){
        let wordValue = uncommonWords[wordIndex];
        //if the word already exists in the object increment its value
        if(wordDictionary[wordValue] > 0){
            wordDictionary[wordValue]++;
        }
        //else set the value to 1
        else {
            wordDictionary[wordValue] = 1;
        }
    }

    //sort the object
    let wordList = sortProperties(wordDictionary);

    //store most used words
    let mostUsedWords = wordList.slice(0,5);
    
    //store least used words
    let leastUsedWords = wordList.slice(-5,wordList.length);

    //write the values to the UI
    ULTemplate(mostUsedWords,document.getElementById("most-used-words"));
    ULTemplate(leastUsedWords,document.getElementById("least-used-words"));

    docLength.innerText = "Document Length: " + text.length;
    wordCount.innerText = "Word Count: " + wordArray.length;
}

//function to sort the values
const sortProperties = (obj) => {
    //first convert the object to an array
    let newArray = Object.entries(obj);

    //Sort the array
    newArray.sort((first,second) => {
        return second[1] - first[1];
    })

    return newArray;
}

const ULTemplate = (items,element) => {
    let rowTemplate = document.getElementById("template-ul-items");
    let templateHTML = rowTemplate.innerHTML;
    let resultsHTML = "";

    for(i=0;i<items.length;i++){
        resultsHTML += templateHTML.replace('{{val}}', items[i][0] + " : " + items[i][1] + " time(s)");
    }

    element.innerHTML = resultsHTML;
}

//filter out stop words
function filterStopWords(wordArray) {
    var commonWords = getStopWords();
    var commonObj = {};
    var uncommonArray = [];

    for (i = 0; i < commonWords.length; i++) {
        commonObj[commonWords[i].trim()] = true;
    }

    for (i = 0; i < wordArray.length; i++) {
        word = wordArray[i].trim().toLowerCase();
        if (!commonObj[word]) {
            uncommonArray.push(word);
        }
    }

    return uncommonArray;
}

//a list of stop words/very common words we don't want to include in stats
function getStopWords() {
    return ["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't", "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't", "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's", "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll", "you're", "you've", "out", "up"];
}

//function to highlight the searched word
const performMark = () => {

    //read the keyword
    let keyword = document.getElementById("keyword").value;
    let display = document.getElementById("file-content");

    let newContent = "";

    //find all the currently marked items
    let spans = document.querySelectorAll('mark');

    //unmark them
    for (let i = 0; i < spans.length; i++) {
        spans[i].outerHTML = spans[i].innerHTML; //<mark>Sanjok</mark> ---> Sanjok
    }

    //use regular expression to find all the occurrence of the keyword in the document
    let re = new RegExp(keyword, "gi");
    let replaceText = "<mark id='markme'>$&</mark>";
    let bookContent = display.innerHTML;

    //add the mark to the book content
    newContent = bookContent.replace(re, replaceText);

    display.innerHTML = newContent;
    let count = document.querySelectorAll('mark').length;
    document.getElementById("search-stats").innerHTML = "found " + count + " matches <img src='images/close.png' class='close-btn' onClick='removeMark()'>";

    if (count > 0) {
        let element = document.getElementById("markme");
        element.scrollIntoView();
    };
}

//function to unhighlight the words
const removeMark = () => {
    //get all the marked items
    let spans = document.querySelectorAll('mark');

    //unmark them
    for (let i = 0; i < spans.length; i++) {
        spans[i].outerHTML = spans[i].innerHTML; //<mark>Sanjok</mark> ---> Sanjok
    }

    //clear search stats
    document.getElementById("search-stats").innerHTML = "";

    //scroll to the top
    document.getElementById("file-content").scrollTop = 0;

    //clear search bar
    document.getElementById("keyword").value = "";
}
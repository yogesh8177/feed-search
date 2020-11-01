const mockData = require('../data/mock_data.json');

class Trie {
    // Pass array of objects
    constructor(arrayOfObjects) {
        // initialize root node, root will have character = null
        this.node = new Node();
        this.dataArray = arrayOfObjects;
    }

    // field name(s) to generate a trie!
    setFieldToGenerateTrie(fieldNameArray) {
        this.trieFieldArray = fieldNameArray;
        return this;
    }

    // build our trie!
    buildTrieForFields() {
        let self = this;
        this.trieFieldArray.forEach(field => {
            let currentFieldValues = this.dataArray.map(item => item[field]);
            currentFieldValues.forEach(word => {
                //console.log('building trie for word: ', word);
                self.buildTrie(word, self.node, 0);
            });
        });
    }

    buildTrie(word, currentNode, currentCharIndex) {
        // if we are at last char, mark word as complete!
        if (currentCharIndex >= word.length) {
            currentNode.isWordComplete = true;
            //console.log('building complete', word);
            return;
        }

        let character = word[currentCharIndex].toLowerCase();
        //console.log('building for char', character, currentCharIndex, word.length);
        // if current char already exists, lets move down the tree!
        if (currentNode.children.hasOwnProperty(character)) {
            currentNode = currentNode.children[character];
            this.buildTrie(word, currentNode, ++currentCharIndex);
        }
        // if character does not exist, then add it to trie!
        else {
            let node = new Node();
            currentNode.children[character] = node;
            this.buildTrie(word, currentNode.children[character], ++currentCharIndex);
        }
    }

    suggestWords(subString) {
        if (!subString) return [];
        let results = this.searchByPrefix(subString, this.node, 0) || [];
        return results;
    }

    searchByPrefix(prefix, node, currentCharIndex, searchResult = '') {
        let self = this;
        let suggestions = [];
        if (currentCharIndex >= prefix.length) {
            // prefix exists, now let us suggest words based on this prefix!
            Object.keys(node.children).forEach(char => {
                //console.log('expanding for', char, searchResult);
                let nextNode = node.children[char];
                let remainingWords = self.findRemainingWords(nextNode, prefix, char);
                suggestions = suggestions.concat(remainingWords);
            });
            return suggestions;
        }

        let currentChar = prefix[currentCharIndex];

        if (node.children.hasOwnProperty(currentChar)) {
            searchResult += currentChar;
            let nextNode = node.children[currentChar];
            //console.log(`found upto: ${searchResult}`);
            return this.searchByPrefix(prefix, nextNode, ++currentCharIndex, searchResult);
        }
        else {
            console.log(`Could not find words for prefix: ${prefix}`);
            return null;
        }
    }

    findRemainingWords(node, prefix, parentChar, resultList = []) {
        let self = this;
        //console.log('=>', `@${prefix}${parentChar}`);
        //console.log({resultList});
        if (Object.keys(node.children).length === 0) {
            if (node.isWordComplete) {
                resultList.push(`${prefix}${parentChar}`);
            }
            return resultList; 
        }
        
        let childrenChars = Object.keys(node.children);

        for (let char of childrenChars) {
            if (node.isWordComplete)  {
                resultList.push(`${prefix}${parentChar}`);
            }
            self.findRemainingWords(node.children[char], prefix, `${parentChar}${char}`, resultList);
        }
        return resultList;
    }
}

class Node {
    constructor() {
        this.isWordComplete = false;
        this.children = {};
    }
}

module.exports = {
    Trie
};
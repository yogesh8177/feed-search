import * as mockData from '../data/mock_data.json';

export class Trie {
    node: Node;
    dataArray: any[];
    extraDotNestedFields: string;
    trieFieldArray: any[]
    // Pass array of objects
    constructor(arrayOfObjects, options) {
        // initialize root node, root will have character = null
        this.node = new Node();
        this.dataArray = arrayOfObjects;
        // `.` separated property names to save inside extraFields key for a word in trie!
        // Eg: 'biography.publisher' will store the string value of publisher inside `extraFields` key.
        this.extraDotNestedFields = options.extraDotNestedFields || '';
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
            let currentFieldValues = this.dataArray.map(item => {
                 return {
                        word: item[field], 
                        extraFields: self.extraDotNestedFields.split('.').reduce((a,b) => a[b], item)
                    }; 
                });
            currentFieldValues.forEach(value => {
                //console.log('building trie for word: ', word);
                self.buildTrie(value, self.node, 0);
            });
        });
    }

    buildTrie(value, currentNode, currentCharIndex) {
        // if we are at last char, mark word as complete!
        if (currentCharIndex >= value.word.length) {
            currentNode.isWordComplete = true;
            currentNode.extraFields = value.extraFields;
            //console.log('building complete', word);
            return;
        }

        let character = value.word[currentCharIndex].toLowerCase();
        //console.log('building for char', character, currentCharIndex, word.length);
        // if current char already exists, lets move down the tree!
        if (currentNode.children.hasOwnProperty(character)) {
            currentNode = currentNode.children[character];
            this.buildTrie(value, currentNode, ++currentCharIndex);
        }
        // if character does not exist, then add it to trie!
        else {
            let node = new Node();
            currentNode.children[character] = node;
            this.buildTrie(value, currentNode.children[character], ++currentCharIndex);
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
        if (node.isWordComplete) {
            resultList.push({ word: `${prefix}${parentChar}`, extraFields: node.extraFields});
        }

        if (Object.keys(node.children).length === 0) {
            return resultList; 
        }
        
        let childrenChars = Object.keys(node.children);

        for (let char of childrenChars) {
            self.findRemainingWords(node.children[char], prefix, `${parentChar}${char}`, resultList);
        }
        return resultList;
    }
}

class Node {

    isWordComplete: boolean;
    children: any;
    extraFields: string = null;

    constructor() {
        this.isWordComplete = false;
        this.children = {};
        this.extraFields = null;
    }
}

module.exports = {
    Trie
};
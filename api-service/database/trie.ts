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

    suggestWords(prefix, searchOnlyPrefix = false) {
        if (!prefix) return [];
        let results = this.searchByPrefix(searchOnlyPrefix, prefix, this.node, 0) || [];
        results.sort((a, b) => b.hits - a.hits);
        return results;
    }

    searchByPrefix(searchOnlyPrefix, prefix, node, currentCharIndex, searchResult = '') : Suggestion[] {
        let self = this;
        let suggestions: Suggestion[] = [];
        if (currentCharIndex >= prefix.length) {
            // prefix exists, now let us suggest words based on this prefix!
            if (node.isWordComplete) {
                // if prefix itself is a word, we increment hit count!
                node.hits++;
                suggestions.push({ word: prefix, extraFields: node.extraFields, hits: node.hits });
            }
            if (searchOnlyPrefix) return suggestions;
            
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
            return this.searchByPrefix(searchOnlyPrefix, prefix, nextNode, ++currentCharIndex, searchResult);
        }
        else {
            console.log(`Could not find words for prefix: ${prefix}`);
            return suggestions;
        }
    }

    findRemainingWords(node, prefix, parentChar, resultList: Suggestion[] = []) : Suggestion[] {
        let self = this;
        //console.log('=>', `@${prefix}${parentChar}`);
        if (node.isWordComplete) {
            resultList.push({ word: `${prefix}${parentChar}`, extraFields: node.extraFields, hits: node.hits});
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
    hits: number;

    constructor() {
        this.isWordComplete = false;
        this.children = {};
        this.extraFields = null;
        this.hits = 0;
    }
}

class Suggestion {
    word: string;
    extraFields: any;
    hits: number
};

module.exports = {
    Trie
};
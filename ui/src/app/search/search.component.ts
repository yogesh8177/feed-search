import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SearchService } from '../Services/search/search.service';
import { AutoCompleteResults } from '../models/Search';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  
  @Input() searchText: string = '';
  @Output() searchTerm = new EventEmitter<string>();
  autoCompleteResults: AutoCompleteResults;

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.autoCompleteResults = new AutoCompleteResults();
    this.autoCompleteResults.data = [];
  }

  setSearchTerm(event) {
    console.log('search term: ', event);
    this.searchText = event;
    this.searchTerm.emit(event);
  }

  triggerAutoComplete(prefix: string) {
    if (prefix.length === 0) {
      this.autoCompleteResults.data.length = 0;
      return;
    }
    if (prefix.length > 1) {
      this.searchService.autoComplete(prefix).subscribe(
        results => {
          this.autoCompleteResults = results;
          //console.log(`autocomplete result`, this.autoCompleteResults);
        },
        error => console.error(error)
      );
    }
  }

  onSuggestionSelect(suggestion: string) {
    let selectedSuggestion = `"${suggestion}"`;
    console.log({selectedSuggestion});
    this.setSearchTerm(selectedSuggestion);
    this.autoCompleteResults.data.length = 0;
  }

}

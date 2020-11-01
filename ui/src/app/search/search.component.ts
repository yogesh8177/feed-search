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
  showSearchToolTip: boolean = false;
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

  setToolTip(event: boolean) {
    this.showSearchToolTip = event;
    this.autoCompleteResults.data.length = 0;
  }

  triggerAutoComplete(prefix: string) {
    if (prefix.length > 1) {
      this.searchService.autoComplete(prefix).subscribe(
        results => {
          this.autoCompleteResults = results;
          console.log(`autocomplete result`, this.autoCompleteResults);
        },
        error => console.error(error)
      );
    }
  }

}

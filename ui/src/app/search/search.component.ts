import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { SearchService } from '../Services/search/search.service';
import { AutoCompleteResults } from '../models/Search';
import { BehaviorSubject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  
  @Input() searchText: string = '';
  @Output() searchTerm = new EventEmitter<string>();
  autoCompleteResults: AutoCompleteResults;
  searchSubject = new BehaviorSubject<string>('');

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.autoCompleteResults = new AutoCompleteResults();
    this.autoCompleteResults.data = [];
    this.subscribeToSearchSubject();
  }

  ngOnDestroy(): void {
    this.searchSubject.unsubscribe();
  }

  subscribeToSearchSubject() {
    this.searchSubject.pipe(
      debounceTime(500),
      switchMap(value => this.searchService.autoComplete(value))
    )
    .subscribe(
      results => {
        this.autoCompleteResults = results;
        console.log(`loaded from switchmap`)
      },
      error => console.error(error)
    );
  }

  setSearchTerm(event) {
    //console.log('search term: ', event);
    this.autoCompleteResults.data.length = 0;
    this.searchText = event;
    this.searchTerm.emit(event);
  }

  onSuggestionSelect(suggestion: string) {
    let selectedSuggestion = `"${suggestion}"`;
    console.log({selectedSuggestion});
    this.setSearchTerm(selectedSuggestion);
    this.autoCompleteResults.data.length = 0;
  }

}

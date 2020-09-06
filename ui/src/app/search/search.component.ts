import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Output() searchTerm = new EventEmitter<string>();

  searchText: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  setSearchTerm(event) {
    this.searchTerm.emit(event);
  }

}

import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  
  @Input() searchText: string = '';
  @Output() searchTerm = new EventEmitter<string>();


  constructor() { }

  ngOnInit(): void {
  }

  setSearchTerm(event) {
    this.searchText = event;
    this.searchTerm.emit(event);
  }

}

import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit {

  @Input() selectedSort: string = '';
  @Output() sortField = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  setSortField(field: string) {
    this.selectedSort = field;
    this.sortField.emit(field);
  }

}

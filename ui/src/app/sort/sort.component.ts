import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit {

  @Output() sortField = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  setSortField(field: string) {
    this.sortField.emit(field);
  }

}

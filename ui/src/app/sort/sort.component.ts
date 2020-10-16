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

  optionGroups: any[] = [
    {
      label: 'Last Edited',
      options: [
        {
          id: 1,
          value: 'dateLastEdited:Date:asc',
          title: 'Edited (asc)'
        },
        {
          id: 2,
          value: 'dateLastEdited:Date:desc',
          title: 'Edited (desc)'
        }
      ]
    },
    {
      label: 'Title',
      options: [
        {
          id: 3,
          value: 'title:string:asc',
          title: 'Title (asc)'
        },
        {
          id: 4,
          value: 'title:string:desc',
          title: 'Title (desc)'
        }
      ]
    }
  ];

  ngOnInit(): void {
    console.log({initialSortField: this.selectedSort});
  }

  setSortField(field: string) {
    this.selectedSort = field;
    this.sortField.emit(field);
    console.log({sortField: this.selectedSort});
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { Feed } from '../models/Feed';
import { TableData } from '../models/TableData';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input() data: Feed[];
  @Input() headers: object[];
  @Input() showCount: boolean = false;

  tableData = TableData;

  constructor() { }

  ngOnInit(): void {
    console.log('headers', Object.keys(Feed));
  }
}

import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  @Input() currentPage: number;
  @Input() currentPageSize: number;
  @Input() maxPage: number;
  @Output() updatedPage = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  updateCurrentPage(event) {
    this.currentPage = event;
  }

  goToNextPage() {
    if ((this.currentPage * this.currentPageSize) < this.maxPage) {
      this.currentPage++;
      this.updatedPage.emit(this.currentPage);
    }
  }

  goToPrevPage() {
    if ((this.currentPage -1) > 0) {
      this.currentPage--;
      this.updatedPage.emit(this.currentPage);
    }
  }

  jumpToPage() {
    console.log('Jumping to page', this.currentPage);
    this.updatedPage.emit(this.currentPage);
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { LoaderService} from '../Services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  @Input() loadingItems: string;
  constructor() { }

  ngOnInit(): void {
  }

}

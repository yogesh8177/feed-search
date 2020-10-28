import { Component, OnInit, Input } from '@angular/core';
import { LoaderService} from '../Services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  showLoader: boolean = false;
  loadingItemArray: string[] = [];
  constructor(
    private loaderService: LoaderService
  ) { }
  
  ngOnInit(): void {
    this.initializeLoader();
  }
  
  initializeLoader() {
    this.loaderService.isLoading.subscribe(
      requests => {
        this.loadingItemArray = requests.map<string>(url => {
          let urlComponents = url.split('?')[0].split('/');
          let loadingItem = urlComponents[urlComponents.length - 1].split('-');
          return loadingItem[loadingItem.length - 1];
        });
      },
      error => console.error(error)
    );
  }
}

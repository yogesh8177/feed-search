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
  ignoreList: string[] = [
    'auto-complete'
  ];
  constructor(
    private loaderService: LoaderService
  ) { }
  
  ngOnInit(): void {
    this.initializeLoader();
  }
  
  initializeLoader() {
    this.loaderService.isLoading.subscribe(
      requests => {
        this.loadingItemArray = requests.map(url => {
          let urlComponents = url.split('?')[0].split('/');
          let lastUrlItem = urlComponents[urlComponents.length - 1];
          if (!this.ignoreList.includes(lastUrlItem)) {
            let loadingItem = lastUrlItem.split('-');
            return loadingItem[loadingItem.length - 1];
          }
        }).filter(i => i !== undefined);
      },
      error => console.error(error)
    );
  }
}

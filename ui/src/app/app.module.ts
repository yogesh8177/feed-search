import { BrowserModule, Meta, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MyHttpInterceptor } from './Interceptor/httpInterceptor';

import { AppComponent } from './app.component';
import { FeedCardComponent } from './feed-card/feed-card.component';
import { SearchComponent } from './search/search.component';
import { SortComponent } from './sort/sort.component';
import { TableComponent } from './table/table.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { LoaderComponent } from './loader/loader.component';
import { ComparatorComponent } from './comparator/comparator.component';
import { LiveMatchComponent } from './live-match/live-match.component';
import { BlogPageComponent } from './blog-page/blog-page.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    FeedCardComponent,
    SearchComponent,
    SortComponent,
    TableComponent,
    PaginatorComponent,
    LoaderComponent,
    ComparatorComponent,
    LiveMatchComponent,
    BlogPageComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [ 
    { provide: HTTP_INTERCEPTORS, useClass: MyHttpInterceptor, multi: true },
     Meta,
     Title,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }

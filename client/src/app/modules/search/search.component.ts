import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import {
  FormListConfig,
  Form,
  SearchService,
  CommonsService,
  UserService,
  User
} from '../../core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {

  @ViewChild('subMenu') subMenu: ElementRef;
  @ViewChild('userFormsTab') userFormsTab: ElementRef;

  public isAuthenticated: boolean;
  public currentUser: String;
  public listConfig: FormListConfig = new FormListConfig();
  public loadingQuery = false;
  public results: Array<any> = [];
  public limit: number = 10;
  public currentPage: number = 1;
  public noMoreForms: boolean = false;

  constructor(
    private userService: UserService,
    private searchService: SearchService,
    private commonsService: CommonsService,
    private location: Location
  ) { }

  ngOnInit() {
    this.loadingQuery = true;
    this.listConfig.orderBy = 'Date';
    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;
          this.setListTo('all');
          // Load the current user's data
          this.userService.currentUser.subscribe(
          (user: User) => {
            this.currentUser = user.username;
          });
          this.searchService.search(this.listConfig)
          .subscribe(forms => {
             this.loadingQuery = false;
             this.results = forms;
         });
      }
    );

    if (window.location.pathname === '/search/user-forms') {
      this.userFormsTab.nativeElement.click();
    } else {
      this.location.replaceState('/');
    }
  }

  setListTo(type: string = '') {
    // Takes all forms
    this.listConfig = {
      type: type,
      limit: this.limit,
      orderBy: 'Date',
      offset: (this.limit * (this.currentPage - 1)),
      query: '',
    };
  }

  setVisibilityOfFooter(visible: boolean) {
    document.getElementsByTagName('footer')[0].hidden = visible;
  }

  moreForms() {
    this.loadingQuery = true;
    this.setPageTo();
    // Create limit and offset filter (if necessary)
    if (this.limit) {
      this.listConfig.limit = this.limit;
      this.listConfig.offset =  (this.limit * (this.currentPage - 1));
    }
    this.searchService.search(this.listConfig).subscribe(forms => {
      if (forms.length !== 0) {
        this.results = this.results.concat(forms);
        this.setVisibilityOfFooter(true);
      } else {
        this.noMoreForms = true;
        this.setVisibilityOfFooter(false);
      }
       this.loadingQuery = false;
   });
  }

  @HostListener('window:scroll', []) onScroll(): void {
    if (!this.loadingQuery && this.noMoreForms === false) {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        this.moreForms();
      }
    }
  }

  search(inputSearch: any) {
    this.loadingQuery = true;
    this.listConfig.offset = 0;
    this.currentPage = 1;
    this.results = [];
    this.noMoreForms = false;
    this.listConfig.query = inputSearch;
    this.searchService.search(this.listConfig)
      .subscribe(forms => {
          this.loadingQuery = false;
          this.results = forms;
        });
    }

  setPageTo() {
    this.currentPage += 1;
  }

  setOrder(order: string) {
    this.loadingQuery = true;
    this.listConfig.offset = 0;
    this.currentPage = 1;
    this.results = [];
    this.noMoreForms = false;
    this.listConfig.orderBy = order;
    this.searchService.search(this.listConfig).subscribe(forms => {
        this.loadingQuery = false;
        this.results = forms;
      });
    }

  topMenuNav(e: any) {
    this.commonsService.subMenuNav(e, this.subMenu.nativeElement);
  }

  setUrl(userForms: boolean) {
    if (userForms) {
      this.location.replaceState('/search/user-forms');
    } else {
      this.location.replaceState('/');
    }
  }
}

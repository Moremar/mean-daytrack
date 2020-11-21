import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../library.service';

@Component({
  selector: 'app-pieces-filter',
  templateUrl: './pieces-filter.component.html',
  styleUrls: ['./pieces-filter.component.css']
})
export class PiecesFilterComponent implements OnInit {

  constructor(private libraryService: LibraryService) { }

  ngOnInit(): void {
  }

  onKeyUp(event: KeyboardEvent) {
    const searchFilter = (event.target as HTMLInputElement).value;
    this.libraryService.setFilter(searchFilter);
  }
}

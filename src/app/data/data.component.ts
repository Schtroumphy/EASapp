import { ViewEncapsulation, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DataComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

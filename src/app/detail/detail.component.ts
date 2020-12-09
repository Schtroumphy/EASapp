import { Component, OnInit } from '@angular/core';
import { Item } from '../core/models/item.schema';
import { DriverService } from '../core/services/app/driver.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  public readonly title = 'my app';
  itemList: Item[];

  constructor(private appservice: DriverService) {}

  ngOnInit(): void {
    console.log('component initialized');
    this.appservice.getItems().subscribe((items) => (this.itemList = items));
  }

  addItem(): void {
    let item = new Item();
    item.name = 'Item ' + this.itemList.length;
    this.appservice.addItem(item).subscribe((items) => (this.itemList = items));
  }

  deleteItem(): void {
    const item = this.itemList[this.itemList.length - 1];
    this.appservice
      .deleteItem(item)
      .subscribe((items) => (this.itemList = items));
  }

}

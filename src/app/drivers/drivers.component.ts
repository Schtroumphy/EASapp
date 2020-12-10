import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';

/*
id: number;

    @Column()
    fisrtname: string;

    @Column()
    lastname: string;

    @Column()
    phoneNumber: number;

    @Column()
    email: string;
    */

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit {

  ELEMENT_DATA: Driver[] = [
    { id: 1, firstname: 'Albert', lastname: "HUBERT", phoneNumber: '7896532140', email: 'albert.huubert@hotmail.fr' },
    { id: 2, firstname: 'Eli', lastname: "TRUE", phoneNumber: '0800970087', email: 'eli.true@gmail.com' },
    { id: 3, firstname: 'Lila', lastname: "CROLI", phoneNumber: '2871543980', email: 'lila.croli@hotmail.com' },
    { id: 4, firstname: 'Albert', lastname: "HUBERT", phoneNumber: '7896532140', email: 'albert.huubert@hotmail.fr' },
    { id: 5, firstname: 'Eli', lastname: "TRUE", phoneNumber: '0800970087', email: 'eli.true@gmail.com' },
    { id: 6, firstname: 'Lila', lastname: "CREOLI", phoneNumber: '2871543980', email: 'lila.croli@hotmail.com' },
    { id: 7, firstname: 'Albert', lastname: "HUBERT", phoneNumber: '7896532140', email: 'albert.huubert@hotmail.fr' },
    { id: 8, firstname: 'Eli', lastname: "TRUE", phoneNumber: '0800970087', email: 'eli.true@gmail.com' },
    { id: 9, firstname: 'Lila', lastname: "CROLI", phoneNumber: '2871543980', email: 'lila.croli@hotmail.com' },
    { id: 10, firstname: 'Albert', lastname: "HUBERT", phoneNumber: '7896532140', email: 'albert.huubert@hotmail.fr' },
    { id: 11, firstname: 'Eli', lastname: "TRUE", phoneNumber: '0800970087', email: 'eli.true@gmail.com' },
    { id: 12, firstname: 'Lila', lastname: "CROLI", phoneNumber: '2871543980', email: 'lila.croli@hotmail.com' },
  ];

  displayedColumns = ['id', 'firstname', 'lastname', 'phoneNumber', 'email', 'actions', 'planning'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource = this.ELEMENT_DATA;
  
  //Form
  driverForm: FormGroup;
  displayDriverForm = true;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }

  //Forms
  initForm() {
    this.driverForm = new FormGroup({
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
    })
  }

  onSubmit() {
    console.log(this.driverForm);
  }

  onClear() {	this.driverForm.reset();}

  //Ajouter un conducteur
  addDriver(){
    this.displayDriverForm = !this.displayDriverForm;
  }

  //Actions on driver
  edit(element){
    console.log("Editer : " + JSON.stringify(element))
  }

  delete(){
    console.log("Delete")
  }

  planning(){
    console.log("PLanning")
  }
  

  addColumn() {
    console.log("Add column")
    const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
    console.log("columnsToDisplay : " + JSON.stringify(this.columnsToDisplay))
    this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }

}

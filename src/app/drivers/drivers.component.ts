import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit {

  //Form
  driverForm: FormGroup;
  displayForm = false;
  newDriver = false;
  updatingDriver = false;

  driverList: Driver[] = [];

  displayedColumns = ['id', 'firstname', 'lastname', 'phoneNumber', 'email', 'comment', 'actions', 'planning'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource: Driver[];

  constructor(private driverService: DriverService, private _router: Router) { }

  ngOnInit(): void {
    this.initForm();
    this.driverService.getDrivers().subscribe((drivers) => (this.driverList = drivers));
    this.updateDatasource();
  }

  //Forms
  initForm() {
    this.driverForm = new FormGroup({
      id: new FormControl(),
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      email: new FormControl(null),
      phoneNumber: new FormControl(null),
      comment:new FormControl(),
      color: new FormControl(null)
    })
  }

  onSubmit() {
    console.log(this.driverForm);
    console.log("Firstname value " + this.driverForm.get('firstname').value);
    console.log("id value " + this.driverForm.get('id').value);
    console.log("Color value " + this.driverForm.get('color').value);

    let driver = new Driver();
    driver.id=this.driverForm.get('id').value;
    driver.firstname = this.driverForm.get('firstname').value;
    driver.lastname = this.driverForm.get('lastname').value;
    driver.email = this.driverForm.get('email').value;
    driver.phoneNumber = this.driverForm.get('phoneNumber').value;
    driver.comment = this.driverForm.get('comment').value;

    if(this.newDriver){
      console.log("Submit NEW")
      this.driverService.addDriver(driver).subscribe(
        (drivers) => {
          this.driverList = drivers
          this.alertWithSuccess('Le conducteur a été ajouté avec succès')
          this.clearDriverForm()
          this.displayForm=false;
          this.newDriver=false;
        },
        (error) => this.errorAlert()
  
  
      );
    } else if(this.updatingDriver){
      console.log("Submit UPDATE")
      this.driverService.updateDriver(driver).subscribe(
        (drivers) => {
          this.driverList=drivers;
          this.alertWithSuccess('Le conducteur a été modifié avec succès')
          this.clearDriverForm()
        }
      )
    }
    
    this.updateDatasource();
  }
  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification de conducteur', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearDriverForm() { 
    this.driverForm.reset();
    this.displayForm = false;
  }

  //Ajouter un conducteur
  displayDriverForm(newDriver : boolean) {
    if(newDriver){
      this.newDriver=true;
      this.updatingDriver = false;
    } else {
      this.updatingDriver = true;
      this.newDriver = false;
    }
    if(!this.displayForm) {
      this.displayForm = !this.displayForm;
    }
      
  }

  //Actions on driver
  editDriver(driver : Driver) {
    this.displayDriverForm(false); //Edit user
    console.log("Editer : " + JSON.stringify(driver))
    this.driverForm.controls["id"].setValue(driver.id);
    this.driverForm.controls["firstname"].setValue(driver.firstname);
    this.driverForm.controls["lastname"].setValue(driver.lastname);
    this.driverForm.controls["email"].setValue(driver.email);
    this.driverForm.controls["phoneNumber"].setValue(driver.phoneNumber);  
  }

  deleteDriver(driver): void {
    console.log("Suppression du conducteur : " +JSON.stringify(driver));
    this.confirmBox(driver)
    
  }

  confirmBox(driver:Driver){  
    let driverName = driver.firstname + " " + driver.lastname;
    Swal.fire({  
      title: 'Etes-vous sûr de vouloir supprimer ' + driverName + " ?",  
      text: 'La suppression est irréversible.',  
      icon: 'warning',  
      showCancelButton: true,  
      confirmButtonText: 'Oui, sûr',  
      cancelButtonText: 'Non, je le garde'  
    }).then((result) => {  
      if (result.value) {  
        this.driverService
      .deleteDriver(driver)
      .subscribe(
        (drivers) => {
          this.driverList = drivers
          Swal.fire(  
            'Supprimé!',  
            driverName + ' a bien été supprimé.',  
            'success'  
          )  
        },
        (error) => {
          Swal.fire(  
            'Erreur',  
            'Echec de la suppression',  
            'error'  
          ) 
        }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {  
        Swal.fire(  
          'Annulé',  
          'Suppression annulée',  
          'error'  
        )  
      }  

    this.updateDatasource();
    })  
  }  

  updateDatasource(){
    this.dataSource = this.driverList;
  }

  planning(event) {
    console.log("PLanning : " + event)
    this._router.navigate(['calendar', {p1: event}]);
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

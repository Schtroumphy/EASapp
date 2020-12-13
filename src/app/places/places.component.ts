import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, MinLengthValidator, Validators } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Place } from '../core/models/place.schema';
import { PlaceService } from '../core/services/app/place.service';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.scss']
})
export class PlacesComponent implements OnInit {

  //Form
  placeForm: FormGroup;
  displayForm = false;
  newPlace = false;
  updatingPlace = false;

  placeList: Place[] = [];

  displayedColumns = ['id', 'label', 'postCode', 'country', 'actions'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource: Place[];

  constructor(private placeService: PlaceService) { }

  ngOnInit(): void {
    this.initForm();
    this.placeService.getPlaces().subscribe((places) => (this.placeList = places));
    this.updateDatasource();

  }

  //Forms
  initForm() {
    this.placeForm = new FormGroup({
      id: new FormControl(),
      label: new FormControl('', Validators.required),
      postCode: new FormControl('', [ Validators.minLength(5), Validators.maxLength(5)]),
      country:new FormControl(''),
    })
  }

  onSubmit() {
    console.log(this.placeForm);
    console.log("Label value " + this.placeForm.get('label').value);
    console.log("postcode value " + this.placeForm.get('postCode').value);
    console.log("Country value " + this.placeForm.get('country').value);

    let place = new Place();
    place.label = this.placeForm.get('label').value;
    place.postCode = this.placeForm.get('postCode').value;
    place.country = this.placeForm.get('country').value;
    

    if(this.newPlace){
      console.log("Submit NEW")
      this.placeService.addPlace(place).subscribe(
        (places) => {
          this.placeList = places
          this.alertWithSuccess('Le lieu a été ajouté avec succès')
          this.clearPlaceForm()
          this.displayForm=false;
          this.newPlace=false;
        },
        (error) => this.errorAlert()
  
  
      );
    } else if(this.updatingPlace){
      console.log("Submit UPDATE")
      place.id=this.placeForm.get('id').value;
      this.placeService.updatePlace(place).subscribe(
        (places) => {
          this.placeList=places;
          this.alertWithSuccess('Le lieu a été modifié avec succès')
          this.clearPlaceForm()
        }
      )
    }
    
    this.updateDatasource();
  }
  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification du lieu', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearPlaceForm() { 
    this.placeForm.reset();
    this.displayForm = false;
  }

  //Ajouter un Place
  displayPlaceForm(newPlace : boolean) {
    if(newPlace){
      this.newPlace=true;
      this.updatingPlace = false;
    } else {
      this.updatingPlace = true;
      this.newPlace = false;
    }
    if(!this.displayForm) {
      this.displayForm = !this.displayForm;
    }
      
  }

  //Actions on Place
  editPlace(place : Place) {
    this.displayPlaceForm(false); //Edit user
    console.log("Editer : " + JSON.stringify(place))
    this.placeForm.controls["id"].setValue(place.id);
    this.placeForm.controls["label"].setValue(place.label);
    this.placeForm.controls["postCode"].setValue(place.postCode);
    this.placeForm.controls["country"].setValue(place.country);
  
  }

  deletePlace(place): void {
    console.log("Suppression du lieu : " +JSON.stringify(place));
    this.confirmBox(place)
    
  }

  confirmBox(place:Place){  
    Swal.fire({  
      title: 'Etes-vous sûr de vouloir supprimer ' + place.label + " ?",  
      text: 'La suppression est irréversible.',  
      icon: 'warning',  
      showCancelButton: true,  
      confirmButtonText: 'Oui, sûr',  
      cancelButtonText: 'Non, je le garde'  
    }).then((result) => {  
      if (result.value) {  
        this.placeService
      .deletePlace(place)
      .subscribe(
        (places) => {
          this.placeList = places
          Swal.fire(  
            'Supprimé!',  
            place.label + ' a bien été supprimé.',  
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
    this.dataSource = this.placeList;
  }

}

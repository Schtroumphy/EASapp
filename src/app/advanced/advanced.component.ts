import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { CalendarOptions, FullCalendarComponent, Calendar } from '@fullcalendar/angular'; // useful for typechecking
import { Evenement } from '../core/models/evenement.schema';
import { EventService } from '../core/services/app/event.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';
import { Patient } from '../core/models/patient.schema';
import { PlaceService } from '../core/services/app/place.service';
import { Place } from '../core/models/place.schema';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss']
})
export class AdvancedComponent implements OnInit {

  eventList: Evenement[];
  driverList: Driver[];
  patientList: Patient[];
  placeList: Place[];
  displayForm = true;
  updateEvent = false;
  eventForm: FormGroup
  displayEventClickedDetails = false
  daysArray = []


  //Form
  newEvent = false;
  updatingEvent = false;
  recurringValues = [];

  selectedStartPointId: string
  selectedStarPoint: Place
  selectedEndPoint: Place
  selectedEndPointId: string
  selectedDriverId: string
  selectedDriver: Driver
  selectedPatientId: string
  selectedPatient: Patient
  dateSelected: string
  selectedJourneyId: string
  favoriteTimeView: string
  eventListToDisplay = []

  eventPicked: string;
  calendarApi: Calendar;
  eventToUpdate: Evenement
  eventIdClicked: number;
  eventClicked: any;
  calendarOptions: CalendarOptions
  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  ngAfterViewInit(): void {
    this.eventList.forEach((item) => {
    })
  }

  constructor(private eventService: EventService, private driverService: DriverService, private patientService: PatientService, private placeService: PlaceService) { }

  ngOnInit(): void {
    registerLocaleData(localeFr, 'fr');
    this.initForm();
    this.eventService.getEvents().subscribe((items) => (this.eventList = items));

    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items
      //console.log(items);
    });
    this.patientService.getPatients().subscribe((items) => {
      this.patientList = items
      //console.log(items);
    });
    this.placeService.getPlaces().subscribe((items) => {
      this.placeList = items
      //console.log(items);
    });
  }

  onPrint() {
    window.print();
  }

  //Forms
  initForm() {
    this.eventForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null, Validators.required),
      patient: new FormControl(null, Validators.required),
      date: new FormControl(null),
      startPoint: new FormControl(null, Validators.required),
      startHour: new FormControl(null),
      endPoint: new FormControl(null, Validators.required),
      endHour: new FormControl(null),
    })
  }

  onSubmit() {
    console.log(this.eventForm);
    //console.log("Selected driver id " + this.selectedDriverId);
    //console.log("Selected patient id " + this.selectedPatientId);
    //console.log("Selected start point id " + this.selectedStartPointId);
    //console.log("Selected end point id " + this.selectedEndPointId);

    this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
      (item) => { this.selectedDriver = item });
    //console.log("DRIVER SELECTED : " + JSON.stringify(this.selectedDriver))

    this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
      (item) => { this.selectedPatient = item });
    //console.log("PATIENT SELECTED : " + JSON.stringify(this.selectedPatient))

    // console.log("Date value " + this.eventForm.get('date').value);
    // console.log("start hour value " + this.eventForm.get('startHour').value);
    // console.log("end hour value " + this.eventForm.get('endHour').value);
    // console.log("Départ value " + this.eventForm.get('startPoint').value);
    // console.log("Arrivée value " + this.eventForm.get('endPoint').value);

    this.placeService.getPlaceById(parseInt(this.selectedStartPointId)).subscribe(
      (item) => { this.selectedStarPoint = item });
    // console.log("Start point SELECTED : " + JSON.stringify(this.selectedStarPoint))

    this.placeService.getPlaceById(parseInt(this.selectedEndPointId)).subscribe(
      (item) => { this.selectedEndPoint = item });
    // console.log("End point SELECTED : " + JSON.stringify(this.selectedEndPoint))

    var eventToAddToDB = new Evenement();
    eventToAddToDB.title = this.selectedPatient.firstname + " " + this.selectedPatient.lastname.toUpperCase();
    eventToAddToDB.patient = this.selectedPatient;
    eventToAddToDB.driver = this.selectedDriver
    eventToAddToDB.date = this.eventForm.get('date').value
    eventToAddToDB.startPoint = this.selectedStarPoint
    eventToAddToDB.endPoint = this.selectedEndPoint
    eventToAddToDB.startHour = this.eventForm.get('startHour').value
    eventToAddToDB.endHour = this.eventForm.get('endHour').value

    console.log("Submit NEW")
    if (this.recurringValues != []) {
      this.recurringValues.forEach(element => {
        //this.getNextDayDateForRecurrence(element).forEach(date => {
        //  eventToAddToDB.date = date;

        //});
        //console.log("Event for recurr " + element + " : " + JSON.stringify(eventToAddToDB))
        //this.addEventToDB(eventToAddToDB)
      });
    } else {
      //this.addEventToDB(eventToAddToDB)
    }

    //console.log("Event to add : " + JSON.stringify(eventToAddToDB))

  }

  addEventToDB(eventToAddToDB) {
    this.eventService.addEvent(eventToAddToDB).subscribe(
      (events) => {
        this.eventList = events

        this.alertWithSuccess('L\'évènement a été ajouté avec succès')
        this.clearEventForm()
        this.displayForm = false;
      },
      (error) => this.errorAlert()
    );
  }


  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification d\'évènement', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearEventForm() {
    this.eventForm.reset();
    this.displayForm = false;
  }

  //Ajouter un evenement
  displayEventForm(newEvent: boolean) {
    this.displayForm = !this.displayForm;
    if (newEvent) {
      this.newEvent = true;
      this.updatingEvent = false;
    } else {
      this.updatingEvent = true;
      this.newEvent = false;
    }
    if (!this.displayForm) {
      this.displayForm = !this.displayForm;
    }
  }

  editEvent(event) {
    this.displayEventClickedDetails = false;
    this.displayEventForm(false);
    console.log("Editer : " + JSON.stringify(event))
    this.eventForm.controls["id"].setValue(event.id);
    this.selectedDriverId = event.driver.id;
    this.selectedPatientId = event.patient.id;
    this.selectedStartPointId = event.startPoint.id;
    this.selectedEndPointId = event.endPoint.id;
    this.eventForm.controls["date"].setValue(event.date);
    this.eventForm.controls["startHour"].setValue(event.startHour);
    this.eventForm.controls["endHour"].setValue(event.endHour);
  }

  displayEventDetails(eventId) {
    this.updateEvent = !this.updateEvent;
    this.eventService.getEventById(eventId).subscribe((eventFound) => {
      this.eventToUpdate = eventFound;
    })

  }

  deleteEventBox(eventId) {
    Swal.fire({
      title: 'Etes-vous sûr de vouloir supprimer cet évènement ?',
      text: 'La suppression est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, sûr',
      cancelButtonText: 'Non, je le garde'
    }).then((result) => {
      if (result.value) {
        this.eventService
          .deleteEvent(eventId)
          .subscribe(
            (events) => {
              this.eventList = events
              this.eventList.forEach(element => {
                console.log(JSON.stringify(element))

              });
              Swal.fire(
                'Supprimé!',
                'L\'évènement a bien été supprimé.',
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
    })
  }

  displayEventClicked(hideOrNot) {
    this.displayEventClickedDetails = hideOrNot;
  }

  deleteEventById(eventId) {
    console.log("event id to delete : " + eventId)
    this.deleteEventBox(eventId);
  }

  getCheckboxValue(event) {
    if (event.target.value == 7) {
      if (event.target.checked) {
        this.recurringValues = [0, 1, 2, 3, 4, 5, 6]
      } else {
        this.recurringValues = []
      }
    } else {
      //console.log("NOT ALL DAY")
      if (this.recurringValues.includes(parseInt(event.target.value))) {
        if (!event.target.checked) {
          //console.log("Remove item")
          this.removeReccuringValue(parseInt(event.target.value))
        }
      } else {
        if (event.target.checked) {
          //console.log("Addin item")
          this.recurringValues.push(parseInt(event.target.value))
        }
      }
    }
    this.updateDaysArray()
    //console.log("Array : " + this.recurringValues.toString())
  }
  updateDaysArray() {
    this.daysArray = []
    this.eventListToDisplay = []

    this.recurringValues.forEach((element) => {

      this.getNextDayDateForRecurrence(element).forEach(date => {
        var eventToAddToDB = new Evenement();
        eventToAddToDB.startHour = this.eventForm.get('startHour').value
        eventToAddToDB.endHour = this.eventForm.get('endHour').value
        console.log("element : " + element)
        eventToAddToDB.date = date;
        this.eventListToDisplay.push(eventToAddToDB)
        console.log("Event to display list : " + JSON.stringify(eventToAddToDB))

      });
      //eventToAddToDB.date = this.getNextDayDateForRecurrence(element);

      console.log("liste : " + JSON.stringify(this.eventListToDisplay))

      if (element == 0) {
        this.daysArray.push("Dimanche")
      } else if (element == 1) {
        this.daysArray.push("Lundi")
      } else if (element == 2) {
        this.daysArray.push("Mardi")
      } else if (element == 3) {
        this.daysArray.push("Mercredi")
      } else if (element == 4) {
        this.daysArray.push("Jeudi")
      } else if (element == 5) {
        this.daysArray.push("Vendredi")
      } else if (element == 6) {
        this.daysArray.push("Samedi")
      } else if (element == 7) {
        this.daysArray = ["tous les jours"]
      }
    })

  }

  removeReccuringValue(dayToRemove) {
    this.recurringValues.forEach((item, index) => {
      if (item === dayToRemove) this.recurringValues.splice(index, 1);
    });
  }

  getNextDayDateForRecurrence(dayNumber) { //0: sunday, 1: monday etc
    var d = new Date();
    var d1 = new Date();
    d.setDate(d.getDate() + (dayNumber + 7 - d.getDay()) % 7);
    var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
    console.log("Date : " + date)
    var dateList = []
    dateList.push(date)

    //Same date 1 week later
    d1.setDate(d.getDate() + 7)
    var date1weekLater = d1.getFullYear() + "-" + (d1.getMonth() + 1) + "-" + d1.getDate()
    dateList.push(date1weekLater)
    console.log("DATE LISTE SUR DEUX SEMAINES : " + JSON.stringify(dateList))

    return dateList;
  }

}
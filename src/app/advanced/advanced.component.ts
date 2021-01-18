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
import { DatePipe, registerLocaleData } from '@angular/common';
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
  updateEvent = false;
  eventForm: FormGroup
  displayEventClickedDetails = false
  daysArray = []
  startHourSelected: string

  //Form
  newEvent = false;
  recurringValues = [];
  displayPlanDriver: boolean = false;
  isDisabledAM: boolean = false;
  isDisabledPM: boolean = false;
  isDisabledAllDay: boolean = false;
  startHourPlanSelected: string;
  endHourPlanSelected: string;
  selectedDatePlan: string;
  eventPlanList = []
  displaySaveButton: boolean = false

  selectedStartPointId: string
  selectedStarPoint: Place
  selectedEndPoint: Place
  selectedEndPointId: string
  selectedDriverId: string
  selectedDriver: Driver
  selectedPatientId: string
  selectedPatient: Patient
  dateSelected: string
  eventListToDisplay = []

  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  displayForm: boolean;
  //periodIdSelected: number;
  selectedPlanDriverId: string;
  intervalsHour = [];
  hours_job: string[] = [];
  hours_job_from: string[] = [];

  ngAfterViewInit(): void {
    this.eventList.forEach((item) => {
    })
  }

  constructor(private eventService: EventService, private driverService: DriverService, private patientService: PatientService, private placeService: PlaceService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    registerLocaleData(localeFr, 'fr');
    this.initForm();
    this.eventService.getEvents().subscribe((items) => (this.eventList = items));

    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items
    });
    this.patientService.getPatients().subscribe((items) => {
      this.patientList = items
    });
    this.placeService.getPlaces().subscribe((items) => {
      this.placeList = items
    });
    this.hours_job = Array.from(Array(23).keys()).map(x => {
      if(x<10){
        return "0" + x
      } else {
        return "" + x
      }
    }).filter(x => parseInt(x) > 7 && parseInt(x)  < 23)
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
    console.log("Event list : " + JSON.stringify(this.eventListToDisplay))

    console.log("Submit NEW EVENt")
    if (this.recurringValues != []) {
      //Add each element to BDD
      this.eventListToDisplay.forEach(element => {
        element.title = element.patient.firstname + " " + element.patient.lastname.toUpperCase();

        //Add it to database
        this.addEventToDB(element);
      });
      this.alertWithSuccess('Les évènements ont été ajouté avec succès')

    } else {
      //Display an error message
      this.errorAlert()
    }

  }

  addEventToDB(eventToAddToDB) {
    this.eventService.addEvent(eventToAddToDB).subscribe(
      (events) => {
        this.eventList = events
        this.clearEventForm()
      },
      (error) => this.errorAlert()
    );
  }

  alertWithSuccess(message) {
    Swal.fire('Ajout d\'évènement(s)', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout d\'un ou plusieurs évènement(s)',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearEventForm() {
    console.log("CLEAR EVENT FORM")
    this.eventForm.reset();
    this.displayForm = false;
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

  //Display form to add event
  displayEventForm() {
    this.displayForm = !this.displayForm;
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

        //add driver, patient, title (from patient), start and end point to add it to datab
        this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
          (item) => { eventToAddToDB.driver = item });
        this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
          (item) => { eventToAddToDB.patient = item });
        this.placeService.getPlaceById(parseInt(this.selectedStartPointId)).subscribe(
          (item) => { eventToAddToDB.startPoint = item });
        this.placeService.getPlaceById(parseInt(this.selectedEndPointId)).subscribe(
          (item) => { eventToAddToDB.endPoint = item });
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
    var zeroString = ""

    d.setDate(d.getDate() + (dayNumber + 7 - d.getDay()) % 7);
    if (d.getMonth() < 10) {
      zeroString = "0"
    } else {
      zeroString = ""
    }
    var date = d.getFullYear() + "-" + zeroString + (d.getMonth() + 1) + "-" + d.getDate()
    console.log("Date : " + date)
    var dateList = []
    dateList.push(date)

    //Same date 1 week later
    d1.setDate(d.getDate() + 7)
    if (d1.getMonth() < 10) {
      zeroString = "0"
    } else {
      zeroString = ""
    }
    var date1weekLater = d1.getFullYear() + "-" + zeroString + (d1.getMonth() + 1) + "-" + d1.getDate()
    dateList.push(date1weekLater)
    console.log("DATE LISTE SUR DEUX SEMAINES : " + JSON.stringify(dateList))

    return dateList;
  }


  // getPeriodSelected(event) {
  //   if (event.target.value == 1) {
  //     //Morning
  //     this.periodIdSelected = 1
  //     this.isDisabledAM = false
  //     if (event.target.checked) {
  //       this.isDisabledAllDay = true
  //       this.isDisabledPM = true
  //     } else {
  //       this.isDisabledAllDay = false
  //       this.isDisabledPM = false
  //     }
  //   } else if (event.target.value == 2) {
  //     //Afternoon
  //     this.periodIdSelected = 2
  //     this.isDisabledPM = false
  //     if (event.target.checked) {
  //       this.isDisabledAllDay = true
  //       this.isDisabledAM = true
  //     } else {
  //       this.isDisabledAllDay = false
  //       this.isDisabledAM = false
  //     }
  //   } else if (event.target.value == 3) {
  //     //Afternoon
  //     this.periodIdSelected = 3
  //     this.isDisabledPM = false
  //     if (event.target.checked) {
  //       this.isDisabledAllDay = true
  //       this.isDisabledAM = true
  //     } else {
  //       this.isDisabledAllDay = false
  //       this.isDisabledAM = false
  //     }
  //   } else {
  //     //All day
  //     this.periodIdSelected = 4
  //     this.isDisabledAllDay = false

  //     if (event.target.checked) {
  //       this.isDisabledPM = true
  //       this.isDisabledAM = true
  //     } else {
  //       this.isDisabledPM = false
  //       this.isDisabledAM = false
  //     }
  //   }
  // }

  test() {
    //console.log(" HOUR JOB " + JSON.stringify(this.hours_job))
    this.createHalfHourIntervals(8, 12) //Morning
    this.displayPlanDriver = !this.displayPlanDriver
  }

  planDriver() {
    this.displaySaveButton = true;
    this.displayPlanDriver = true;
    this.eventPlanList = []
    console.log("Date selected : " + this.selectedDatePlan)
    console.log("Driver selected : " + this.selectedPlanDriverId)
    //console.log("Period selected : " + this.periodIdSelected)
    console.log("Period start selected : " + this.startHourPlanSelected)
    console.log("Period end selected : " + this.endHourPlanSelected)
    var from, until;
    from = parseInt(this.startHourPlanSelected)
    until = parseInt(this.endHourPlanSelected)
    // if (this.periodIdSelected == 1) {
    //   from = 8
    //   until = 12
    // } else if (this.periodIdSelected == 2) {
    //   from = 12
    //   until = 17
    // } else if (this.periodIdSelected == 3) {
    //   from = 17
    //   until = 22
    // } else {
    //   from = 8
    //   until = 22
    // }
    var driverPlan;
    this.driverService.getDriverById(parseInt(this.selectedPlanDriverId)).subscribe((item) => {
      driverPlan = item
    });

    var startHour, endHour;
    // if (d.getMonth() < 10) {
    //   zeroString = "0"
    // } else {
    //   zeroString = ""
    // }
    this.intervalsHour = this.createHalfHourIntervals(from, until)
    this.intervalsHour.forEach((interval) => {
      startHour = interval[0]
      endHour = interval[1]
      console.log("START HOUR TRANS : " + JSON.stringify(startHour))
      console.log("END HOUR TRANS : " + JSON.stringify(endHour))

      //console.log(JSON.stringify(interval))
      var eventPlan = new Evenement()
      eventPlan.date = this.selectedDatePlan
      eventPlan.driver = driverPlan
      eventPlan.patient = null
      eventPlan.startPoint = null
      eventPlan.startHour = startHour
      eventPlan.endPoint = null
      eventPlan.endHour = endHour
      this.eventPlanList.push(eventPlan)
    })
    console.log("Event plan list : " + JSON.stringify(this.eventPlanList))
  }

  removeInterval(interval) {
    console.log("Remove " + interval)
    this.intervalsHour = this.intervalsHour.filter(e => e !== interval)
    this.eventPlanList = this.eventPlanList.filter(e => e.startHour !== interval[0] && e.endHour !== interval[1])
    console.log("Event plan list : " + JSON.stringify(this.eventPlanList))
  }

  createHalfHourIntervals(from, until) {
    var intervals = [];
    var quarterHours = ["00", "15", "30", "45"];
    for (let i = from; i < until; i++) {
      console.log("i : " + i)
      quarterHours.forEach(quarter => {
        if(i<10){
          intervals.push("0" + i + ":" + quarter)
        }else {
          intervals.push(i + ":" + quarter)
        }
        console.log("Intervals " + JSON.stringify(intervals))
      })
    }
    until<10 ? intervals.push("0" + until + ":00") : intervals.push(until + ":00")

    var intervals2 = []
    var intervalsDef = []

    intervals.forEach((element, i) => {
      if (i == 0)
        intervals2.push(element)
      else {
        intervals2.push(element)
        intervalsDef.push(intervals2)
        intervals2 = []
        intervals2.push(element)
      }
      console.log("Intervals DEf " + JSON.stringify(intervalsDef))
      //console.log("Intervals 2 " + JSON.stringify(intervals2))
    })
    return intervalsDef;
  }

  updateHoursJobFrom() {
    this.hours_job_from = this.hours_job.filter(e => parseInt(e) > parseInt(this.startHourPlanSelected))
  }

  savePatientPlanSelection(hour, index, patientId) {
    console.log("PATIENT PLAN SELECTION")
    console.log("Hour " + JSON.stringify(hour))
    console.log("Index " + index)
    console.log("Patient id " + patientId)
    this.patientService.getPatientById(parseInt(patientId)).subscribe(
      (item) => {
        var foundIndex = this.eventPlanList.findIndex(e => e.startHour == hour[0] && e.endHour == hour[1])
        this.eventPlanList[foundIndex].patient = item
        console.log("Index : " + foundIndex + " | " + JSON.stringify(this.eventPlanList[foundIndex]))
      });
    console.log("Event plan patient " + JSON.stringify(this.eventPlanList.find(e => e.startHour == hour[0] && e.endHour == hour[1])))
  }

  saveStartHourSelection(hour, index, placeId) {
    console.log("START PLAN SELECTION")
    console.log("Hour " + hour)
    console.log("Index " + index)
    console.log("Start Place id " + placeId)
    this.placeService.getPlaceById(parseInt(placeId)).subscribe(
      (item) => {
        var foundIndex = this.eventPlanList.findIndex(e => e.startHour == hour[0] && e.endHour == hour[1])
        this.eventPlanList[foundIndex].startPoint = item
        console.log("Index : " + foundIndex + " | " + JSON.stringify(this.eventPlanList[foundIndex]))
      });
    console.log("Start point plan " + JSON.stringify(this.eventPlanList.find(e => e.startHour == hour[0] && e.endHour == hour[1])))
  }
  saveEndHourSelection(hour, index, placeId) {
    console.log("END PLAN SELECTION")
    console.log("Hour " + hour)
    console.log("Index " + index)
    console.log("End Place id " + placeId)
    this.placeService.getPlaceById(parseInt(placeId)).subscribe(
      (item) => {
        var foundIndex = this.eventPlanList.findIndex(e => e.startHour == hour[0] && e.endHour == hour[1])
        this.eventPlanList[foundIndex].endPoint = item
        console.log("Index : " + foundIndex + " | " + JSON.stringify(this.eventPlanList[foundIndex]))
      });
    console.log("Start point plan " + JSON.stringify(this.eventPlanList.find(e => e.startHour == hour[0] && e.endHour == hour[1])))
  }

  savePlan() {
    console.log("EVENT PLAN AFTER SAVE " + JSON.stringify(this.eventPlanList))
    const emptyCondition = (currentValue) => currentValue.patient == null && currentValue.startPoint == null && currentValue.endPoint == null;

    if (this.eventPlanList.every(emptyCondition)) {
      alert("Aucune modification n'a été détecté")
    } else {
      //Sort complete event and remove incomplete
      console.log("Event plan list before sorting : " + JSON.stringify(this.eventPlanList))
      this.eventPlanList = this.eventPlanList.filter(e => e.patient !== null && e.startPointId !== null && e.endPoint !== null)
      console.log("Event plan list after sorting : " + JSON.stringify(this.eventPlanList))

      if (!this.eventPlanList.length) { // Check if array is empty
        alert("Aucune planification n'est complète (patient et trajet)")
      } else {
        //Save each event
        this.eventPlanList.forEach(element => {
          element.title = element.patient.firstname + " " + element.patient.lastname.toUpperCase();

          //Add it to database
          this.addEventToDB(element);
        });
        this.alertWithSuccess('Les évènements ont été ajouté avec succès')

        //Clear eventPlanList
        this.eventPlanList = []

      }
      this.displaySaveButton = false;

      //Hide plan driver list
      this.displayPlanDriver = false
    }

  }
}
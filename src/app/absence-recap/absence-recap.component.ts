import { Component, OnInit } from '@angular/core';
import { Absence } from 'app/core/models/absence.schema';
import { AbsenceService } from 'app/core/services/app/absence.service';

@Component({
  selector: 'app-absence-recap',
  templateUrl: './absence-recap.component.html',
  styleUrls: ['./absence-recap.component.scss']
})
export class AbsenceRecapComponent implements OnInit {

  displayedColumns = ['id', 'driver', 'startDate', 'endDate', 'reason', 'actions'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource: Absence[];

  absenceList: Absence[] = [];


  constructor(private absenceService : AbsenceService) { }

  ngOnInit(): void {
    //this.initForm();
    this.absenceService.getAllAbsences().subscribe((absences) => {
      this.absenceList = absences
      this.dataSource = this.absenceList
    });
    console.log("All absences : " + JSON.stringify(this.absenceList))
    //this.updateDatasource();
  }

}

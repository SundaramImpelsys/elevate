import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { UserData } from '../../interfaces/user.data'; 

import { Store } from '@ngrx/store'; 
import { selectIsLoggedIn, selectUser } from '../../store/selectors/userVerification.selectors'; 
import { AuthState } from '../../store/reducers/userVerification.reducers';
import { logout, updateUser } from 'src/app/store/actions/userVerification.actions';
import { DeleteCoursesDialogComponent } from 'src/app/components/delete-courses-dialog/delete-courses-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { CustomDialogComponent } from 'src/app/components/custom-dialog/custom-dialog.component';
import { CountService } from 'src/app/services/count.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: UserData | null = null;
  isLoggedIn: boolean = false;
  isCreatingCourse: any;
  viewAllCourse: boolean = false;
  createdCoursesEmpty: boolean = false;
  isAdmin: boolean = false;

  //for admins dashboard
  totalTrainers: number = 0;
  totalCourses: number = 0;
  totalWorkshops: number = 0;
  loadingCourse: boolean = true; 
  loadingWorkshop: boolean = true;
  loadingTrainer: boolean = true;
  showPieChart: boolean = false;

  constructor(
    private readonly router: Router, 
    public dialog: MatDialog,
    private readonly countService: CountService,
    private readonly dataService: DataService, 
    private readonly store: Store<AuthState>) {}

  ngOnInit(): void {

    this.store.select(selectIsLoggedIn).subscribe(isLoggedIn => { 
      this.isLoggedIn = isLoggedIn; 
    }); 
    
    this.store.select(selectUser).subscribe(user => { 
      this.user = user;
      if(user.role == 'Administrator'){
        this.isAdmin = true;
      }
      console.log(user);
      if(user.createdCourses.length === 0){
        this.createdCoursesEmpty = true;
      }
    });

    //for administration
    this.countService.getTrainerCount().subscribe({
      next: (trainerCount) => {
        this.totalTrainers = trainerCount;  
        this.loadingCourse = false; 
        this.pieChart(); 
      },
      error: (err) => {
        console.error('Error loading course count:', err);
        this.loadingCourse = false; 
      },
    });

    this.countService.getWorkshopCount().subscribe({
      next: (workshopCount) => {
        this.totalWorkshops = workshopCount;  
        this.loadingWorkshop = false; 
      },
      error: (err) => {
        console.error('Error loading course count:', err);
        this.loadingWorkshop = false; 
      },
    });

    this.countService.getCourseCount().subscribe({
      next: (courseCount) => {
        this.totalCourses = courseCount;  
        this.loadingCourse = false;  
      },
      error: (err) => {
        console.error('Error loading course count:', err);
        this.loadingCourse = false; 
      },
    });

  }

  pieChart() {
    this.showPieChart = true;
  }

  viewAllCoursesToggle(): void { 
    this.viewAllCourse = !this.viewAllCourse; 
  }
  

  startLearning(courseTitle: string): void {
    this.router.navigate(['/course-page'], { queryParams: { title: courseTitle } });
  }
  

  removeCourse(course: string): void {
    if (this.user) {
      const userClone = { ...this.user, enrolledCourses: [...this.user.enrolledCourses.filter(c => c !== course)] };
      this.user = userClone;  
      this.store.dispatch(updateUser({ user: this.user}));
      this.dataService.putItem(this.user.id, this.user).subscribe(() => {
        console.log('Course removed successfully');
      });
    }
  }
  
  openDeleteDialog(mes: string): void { 
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, { 
      data: { message: mes } 
    }); 
    dialogRef.afterClosed().subscribe(result => { 
      if (result) { 
        this.deleteAccount(); 
      } 
    }); 
  }

  deleteAccount(): void {
    if (this.user) {
      this.dataService.deleteItem(this.user.id).subscribe(
        () => {
          console.log('Account deleted successfully');
          localStorage.clear();
          this.store.dispatch(logout());
          this.isLoggedIn = false;
          this.router.navigate(['']);
        },
        (error: any) => {
          this.openDialog('An error occurred. Please try again.');
        }
      );
    }
  }

  openDialog(mes: string): void { 
    this.dialog.open(CustomDialogComponent, { 
      data: { message: mes } 
    });
  }
  
  openDeleteCoursesDialog(): void { 
    const dialogRef = this.dialog.open(DeleteCoursesDialogComponent, 
      { width: '300px', data: {} 
      }); 
      
      dialogRef.afterClosed().subscribe(result => { 
        console.log('The dialog was closed'); 
      }); 
    }

}

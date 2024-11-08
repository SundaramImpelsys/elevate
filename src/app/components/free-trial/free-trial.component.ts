import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormData } from '../../interfaces/form.data';

@Component({
  selector: 'app-free-trial',
  templateUrl: './free-trial.component.html',
  styleUrls: ['./free-trial.component.css']
})
export class FreeTrialComponent implements OnInit {
  freeTrialForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.freeTrialForm = this.fb.group({
      name: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,}$')]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.freeTrialForm.valid) {
      const formData: FormData = this.freeTrialForm.value;
      console.log('Form Data:', formData);
      alert('We will get back to you soon!');
    }
    else{
      alert('Please fill out all the required fields');
    }
  }
}

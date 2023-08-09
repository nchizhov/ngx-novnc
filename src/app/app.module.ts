import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {ButtonModule} from 'primeng/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastModule} from 'primeng/toast';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {InputTextModule} from 'primeng/inputtext';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {PasswordDialogComponent} from './dialogs/password-dialog/password-dialog.component';
import {VncKeyButtonsComponent} from './vnc-key-buttons/vnc-key-buttons.component';
import {VncClipboardButtonsComponent} from './vnc-clipboard-buttons/vnc-clipboard-buttons.component';
import {VncViewButtonsComponent} from './vnc-view-buttons/vnc-view-buttons.component';
import {VncActionButtonsComponent} from './vnc-action-buttons/vnc-action-buttons.component';

@NgModule({
  declarations: [
    AppComponent,
    VncKeyButtonsComponent,
    VncClipboardButtonsComponent,
    VncViewButtonsComponent,
    VncActionButtonsComponent,

    PasswordDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    DynamicDialogModule,
    InputTextModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

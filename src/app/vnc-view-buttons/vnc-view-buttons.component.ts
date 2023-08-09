import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output} from '@angular/core';
// @ts-ignore
import RFB from "@novnc/novnc/core/rfb.js";
import * as moment from 'moment/moment';
import {saveAs} from 'file-saver';
import {DOCUMENT} from '@angular/common';
import {MessageService} from 'primeng/api';

import {imageDataToBlob} from '../funcs';
import {getToastMessage} from '../toast-messages';

@Component({
  selector: 'app-vnc-view-buttons',
  templateUrl: './vnc-view-buttons.component.html'
})
export class VncViewButtonsComponent implements OnInit {
  @Input() rfb!: RFB;
  @Input() isView!: boolean;
  @Input() isConnected!: boolean;
  @Input() resetToggleButtons!: Function;

  @Output() isViewChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @HostListener('document:fullscreenchange', ['$event'])
  baseFullscreenChange(): void {
    this.ifFullScreen = this.document.fullscreenElement !== null;
  }

  ifFullScreen: boolean = false;
  private docElement!: any;

  constructor(@Inject(DOCUMENT) private document: any,
              private messageService: MessageService) {}

  ngOnInit() {
    this.docElement = document.documentElement;
  }

  onTakeScreenshot(): void {
    if (!this.rfb) {
      return;
    }
    // TODO: В название добавлять IP/название машины?
    imageDataToBlob(this.rfb.getImageData())
      .then((data: Blob) => {
        const date: string = moment().format('DD.MM.YYYY_HH_mm_ss');
        saveAs(data, `screenshot_${date}.png`);
      })
      .catch((reason: any) => this.messageService.add(getToastMessage('screenshot_error', reason)));
  }

  onToggleView(): void {
    if (!this.rfb) {
      return;
    }
    this.rfb.viewOnly = !this.rfb.viewOnly;
    this.isViewChange.emit(this.rfb.viewOnly);
    this.resetToggleButtons();
  }

  onToggleFullScreenView(): void {
    if (!this.ifFullScreen) {
      if (this.docElement.requestFullscreen) {
        this.docElement.requestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      }
    }
  }
}

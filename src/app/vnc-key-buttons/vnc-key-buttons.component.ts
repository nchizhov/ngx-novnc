import {Component, Input} from '@angular/core';
// @ts-ignore
import RFB from "@novnc/novnc/core/rfb.js";

import {IVncButton} from '../interfaces/vnc-button.interface';
import {toggleButtons} from '../toggle-buttons';
import {IVncKey} from '../interfaces/vnc-key.interface';
import {VNCKeys} from '../vnc-keys';

@Component({
  selector: 'app-vnc-key-buttons',
  templateUrl: './vnc-key-buttons.component.html',
  styleUrls: ['./vnc-key-buttons.component.scss']
})
export class VncKeyButtonsComponent {
  @Input() rfb!: RFB;
  @Input() isView!: boolean;
  @Input() isConnected!: boolean;

  private toggleButtons: {[s: string]: IVncButton} = toggleButtons;

  onPressAltCtrlDel(): void {
    if (!this.rfb) {
      return;
    }
    this.rfb.sendCtrlAltDel();
    this.rfb.focus();
  }

  onPressToggleKey(name: string): void  {
    if (!this.rfb) {
      return;
    }
    const button: IVncButton = this.toggleButtons[name];
    button.status = !button.status;
    this.rfb.sendKey(button.key.vnc, button.key.name, button.status);
    this.rfb.focus();
  }

  onPressKey(name: string): void {
    if (!this.rfb) {
      return;
    }
    const key: IVncKey = VNCKeys[name];
    this.rfb.sendKey(key.vnc, key.name);
  }

  getToggleStatus(button: string): boolean {
    return this.toggleButtons[button].status;
  }
}

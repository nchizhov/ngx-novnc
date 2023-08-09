import {IVncButton} from './interfaces/vnc-button.interface';
import {VNCKeys} from './vnc-keys';

export const toggleButtons: {[s: string]: IVncButton} = {
  'win': {
    status: false,
    key: VNCKeys['XK_Super_L']
  },
  'alt': {
    status: false,
    key: VNCKeys['XK_Alt_L']
  },
  'ctrl': {
    status: false,
    key: VNCKeys['XK_Control_L']
  }
}

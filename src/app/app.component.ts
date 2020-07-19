import { Component, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterContentInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges, AfterViewInit {
  p = 1;
  url = 'http://localhost:3000/pics';
  pics = [];
  copy = [];
  shapes = [];
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  @ViewChild('textdrag', {static: true})
  textdrag: ElementRef<HTMLTemplateElement>;
  bgImage = false;



// drag related vars
  isDragging = false;
  startX: any;
  startY: any;
  selectedShapeIndex: any;
  offsetX: any;
  offsetY: any;
  pencilColor = 'red';
	// tslint:disable-next-line: indent
  pencilWidth = 10;
  painting = false;
  textMessage = 'Draggable text';
  constructor(private http: HttpClient) {
    this.fectch();
  }
  ngAfterViewInit(): void {
    // this.canvasImageMove();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.height  = window.innerHeight;
    this.canvas.nativeElement.width = this.canvas.nativeElement.height * (9 / 16);
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    // for (let x = 0, len = this.shapes.length; x < len; x++) {
    //   const obj = this.shapes[x];
    //   obj.context.drawImage(obj.image, obj.x, obj.y);
    // }
    const requestAnimationFrame = window.requestAnimationFrame ||
                                      window.webkitRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  }

fectch() {
    this.http.get(this.url).subscribe((res: any) => {
      this.pics = res;
      this.copy = res;
    });
  }

onChange(event: any) {
    // console.log(event);
    const val = event.target.value.toLowerCase();
    const res = this.copy.filter((item) => {
     return item.author.toLowerCase().includes(val) || !val;
   });
    this.pics = res;
  }

saveImage() {
    const dataURL = this.canvas.nativeElement.toDataURL('image/jpeg', 1.0);
    this.downloadImage(dataURL, 'my-canvas.jpeg');
  }

  // Save | Download image
downloadImage(data, filename = 'untitled.jpeg') {
    const downlink = document.createElement('a');
    downlink.href = data;
    downlink.download = filename;
    document.body.appendChild(downlink);
    downlink.click();
  }


  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point
              pairwise()
            );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        this.drawOnCanvas(prevPos, currentPos);
      });
  }
 
  private drawOnCanvas(
    prevPos: { x: number, y: number },
    currentPos: { x: number, y: number }
  ) {
    // incase the context is not set
    if (!this.ctx) { return; }
    this.ctx.lineWidth = this.pencilWidth || 10;
    // start our drawing path
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.pencilColor || 'red';
    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      this.ctx.moveTo(prevPos.x, prevPos.y); // from

      // draws a line from the start pos until the current position
      this.ctx.lineTo(currentPos.x, currentPos.y);

      // strokes the current path with the styles we set earlier
      this.ctx.stroke();
    }
  }
drawPencil(element) {
    // console.log(element.target.checked);
    if (element.target.checked) {
      this.captureEvents(this.canvas.nativeElement);
    } else {
      this.pencilColor = '#fff';
      this.pencilWidth = 0;
    }
  }
setParagraph(element) {
    this.textMessage = element.target.value;
  }
onTextDrag(event: any) {
    event.dataTransfer.setData('text/plain', 'xyz');
  }
setColor(element) {
    // console.log("setColor", element.value);
    this.textdrag.nativeElement.style.color = element.target.value;
  }
setColorPencil(element) {
    this.pencilColor = element.target.value;
  }
setWidthPencil(element) {
    this.pencilWidth = element.target.value;

  }
onDrag(e: any) {
    // console.log(e);
    e.dataTransfer.setData('key', e.target.id);
    e.dataTransfer.setData('mouse_position_x', e.clientX - e.target.offsetLeft );
    e.dataTransfer.setData('mouse_position_y', e.clientY - e.target.offsetTop  );

    e.dataTransfer.setData('image_id', e.target.id);
    this.dragDropFeature();
    const dropItem = e.dataTransfer.getData('key');
    const dropElement = document.getElementById(dropItem);
  }
dragDropFeature() {
  this.canvas.nativeElement.ondragover = (event) => {
    event.preventDefault();
  };
  this.canvas.nativeElement.ondrop = (event) => {
    event.preventDefault();
    const dropItem = event.dataTransfer.getData('key');
    const dropElement = document.getElementById(dropItem);
    this.ctx.font = '30px Comic Sans MS';
    this.ctx.fillStyle = dropElement.style.color || 'red';
    this.ctx.textAlign = 'center';
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if ('src' in dropElement) { // if element is an image
      if (!this.bgImage) {
        this.ctx.drawImage(dropElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        this.bgImage = true; // background image set as entire canvas
      } else {
        /*If there is already a background image set,
         then new image should be added on top of the canvas,
          and should be added as per its aspect ratio
        */
        this.ctx.drawImage(dropElement, x, y, 200, 200);
      }
    } else {// if element is a text
      this.ctx.fillText(dropElement.innerText, x, y);
    }
  };
}

allowDrop(e) {
      e.preventDefault();
}
drop(e) {
     e.preventDefault();
     const image = document.getElementById( e.dataTransfer.getData('image_id') );

      // tslint:disable-next-line: variable-name
     const mouse_position_x = e.dataTransfer.getData('mouse_position_x');
      // tslint:disable-next-line: variable-name
     const mouse_position_y = e.dataTransfer.getData('mouse_position_y');
    //  console.log('img', image.offsetWidth,'--',image.offsetHeight);
     this.shapes.push({
        context: this.ctx,
        image,
        x: e.clientX - this.canvas.nativeElement.offsetLeft - mouse_position_x,
        y: e.clientY - this.canvas.nativeElement.offsetTop  - mouse_position_y,
        width: image.offsetWidth,
        height: image.offsetHeight
      });

    //  console.log(this.shapes);

  }
}



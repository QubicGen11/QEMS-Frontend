import React, { Component } from 'react';

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      radius: 0,
      ctx: null
    };
  }

  componentDidMount() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    const radius = canvas.height / 2;

    ctx.translate(radius, radius);
    const newRadius = radius * 0.90;
    
    this.setState({ radius: newRadius, ctx: ctx });
    
    this.timerID = setInterval(() => this.drawClock(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  drawClock() {
    this.drawFace();
    this.drawNumbers();
    this.drawTime();
  }

  drawFace() {
    const { ctx, radius } = this.state;
    var grad;
    ctx.beginPath();
    ctx.arc(0,0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    
    grad = ctx.createRadialGradient(0,0,radius * 0.95, 0,0, radius * 1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(0,0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
  }

  drawNumbers() {
    const { ctx, radius } = this.state;
    var ang;
    var num;
    ctx.font = radius * 0.15 + "px arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for(num = 1; num < 13; num++) {
      ang = num * Math.PI / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.85);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.rotate(ang);
      ctx.translate(0, radius * 0.85);
      ctx.rotate(-ang);
    }
  }

  drawTime() {
    const { ctx, radius } = this.state;
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    // hour
    hour = hour%12;
    hour = (hour*Math.PI/6) +
      (minute*Math.PI/(6*60)) +
      (second*Math.PI/(360*60));
    this.drawHand(hour, radius*0.5, radius*0.07);
    
    // minute
    minute = (minute*Math.PI/30) + 
      (second*Math.PI/(30*60));
    this.drawHand(minute, radius*0.8, radius*0.07);
    
    // second
    second = (second*Math.PI/30);
    this.drawHand(second, radius*0.9, radius*0.02);
  }

  drawHand(pos, length, width) {
    const { ctx } = this.state;
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
  }

  render() {
    return (
      <canvas ref="canvas" width={90} height={40} style={{backgroundColor:'#333'}}/>
    );
  }
}

export default Clock;

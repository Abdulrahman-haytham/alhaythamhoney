/* الهيثم — drawing loader. Plain JavaScript; no dependencies. */
(() => {
  'use strict';
  if (!window.customElements || customElements.get('haytham-loader')) return;
  const LOGO = "<svg xmlns=\"http://www.w3.org/2000/svg\" data-animate=\"\" class=\"hd-logo\" viewBox=\"215 200 875 905\" aria-hidden=\"true\">\n      <title id=\"hd-title\">شعار الهيثم — نحل وعسل</title>\n      <desc id=\"hd-description\">تظهر الأجنحة ثم الحروف والتفاصيل تدريجياً باللون الذهبي. نسخة مرسومة كمسارات، مستوحاة من صورة الشعار.</desc>\n      <style>\n    .hd-logo { color-scheme: light dark; }\n    .hd-gold-start { stop-color: #98601c; }\n    .hd-gold-middle { stop-color: #d7a343; }\n    .hd-gold-end { stop-color: #ab7228; }\n    .hd-mask-line { stroke-dasharray: 1; stroke-dashoffset: 0; }\n    [data-animate] .hd-mask-line { animation: haytham-trace var(--time) ease-in-out var(--delay) both; }\n    .hd-caption { fill: #594422; }\n    .hd-caption-letter { opacity: 1; }\n    [data-animate] .hd-caption-letter {\n      animation: haytham-type 1ms steps(1, end) var(--type-delay) both;\n    }\n    @keyframes haytham-type { from { opacity: 0; } to { opacity: 1; } }\n    @keyframes haytham-trace {\n      0% { stroke-dashoffset: 1; opacity: 0; }\n      0.1% { opacity: 1; }\n      100% { stroke-dashoffset: 0; opacity: 1; }\n    }\n    @media (prefers-color-scheme: dark) {\n      .hd-gold-start { stop-color: #c18834; }\n      .hd-gold-middle { stop-color: #f9df8a; }\n      .hd-gold-end { stop-color: #c9984e; }\n      .hd-caption { fill: #e4d4b5; }\n    }\n    @media (prefers-reduced-motion: reduce) {\n      [data-animate] .hd-mask-line { animation: none; }\n      [data-animate] .hd-caption-letter { animation: none; }\n    }\n</style>\n      <defs>\n        <linearGradient id=\"hd-gold\" x1=\"0\" y1=\"1\" x2=\"1\" y2=\"0\">\n          <stop class=\"hd-gold-start\" offset=\"0\" />\n          <stop class=\"hd-gold-middle\" offset=\"0.58\" />\n          <stop class=\"hd-gold-end\" offset=\"1\" />\n        </linearGradient>\n        <mask id=\"hd-left-wing\" maskUnits=\"userSpaceOnUse\" x=\"200\" y=\"180\" width=\"900\" height=\"840\" style=\"mask-type:alpha\">\n          <path class=\"hd-mask-line\" pathLength=\"1\" d=\"M684 653 C599 570 551 388 571 279 C593 152 701 352 704 475\" fill=\"none\" stroke=\"white\" stroke-width=\"105\" stroke-linecap=\"round\" style=\"--time:450ms;--delay:80ms\" />\n        </mask>\n        <mask id=\"hd-right-wing\" maskUnits=\"userSpaceOnUse\" x=\"200\" y=\"180\" width=\"900\" height=\"840\" style=\"mask-type:alpha\">\n          <path class=\"hd-mask-line\" pathLength=\"1\" d=\"M775 620 C876 532 991 310 907 299 C823 267 655 510 716 713\" fill=\"none\" stroke=\"white\" stroke-width=\"110\" stroke-linecap=\"round\" style=\"--time:640ms;--delay:250ms\" />\n        </mask>\n        <mask id=\"hd-arch\" maskUnits=\"userSpaceOnUse\" x=\"200\" y=\"180\" width=\"900\" height=\"840\" style=\"mask-type:alpha\">\n          <path class=\"hd-mask-line\" pathLength=\"1\" d=\"M710 707 C806 651 889 663 941 763 C972 820 979 864 1024 876\" fill=\"none\" stroke=\"white\" stroke-width=\"92\" stroke-linecap=\"round\" style=\"--time:440ms;--delay:740ms\" />\n        </mask>\n        <mask id=\"hd-bowl\" maskUnits=\"userSpaceOnUse\" x=\"200\" y=\"180\" width=\"900\" height=\"840\" style=\"mask-type:alpha\">\n          <path class=\"hd-mask-line\" pathLength=\"1\" d=\"M826 906 C870 881 908 773 863 769 C805 763 780 874 826 904 C908 935 1001 891 1050 861 M828 914 C748 891 691 832 679 749\" fill=\"none\" stroke=\"white\" stroke-width=\"96\" stroke-linecap=\"round\" style=\"--time:580ms;--delay:860ms\" />\n        </mask>\n        <mask id=\"hd-letters\" maskUnits=\"userSpaceOnUse\" x=\"200\" y=\"180\" width=\"900\" height=\"840\" style=\"mask-type:alpha\">\n          <path class=\"hd-mask-line\" pathLength=\"1\" d=\"M682 751 C656 887 573 865 554 765 C531 823 430 878 356 821 C389 734 425 642 487 702 L542 764 M364 821 C333 854 290 876 244 868\" fill=\"none\" stroke=\"white\" stroke-width=\"112\" stroke-linecap=\"round\" style=\"--time:520ms;--delay:950ms\" />\n        </mask>\n        <mask id=\"hd-crescent\" maskUnits=\"userSpaceOnUse\" x=\"200\" y=\"180\" width=\"900\" height=\"840\" style=\"mask-type:alpha\">\n          <path class=\"hd-mask-line\" pathLength=\"1\" d=\"M681 748 C675 641 585 635 558 725\" fill=\"none\" stroke=\"white\" stroke-width=\"90\" stroke-linecap=\"round\" style=\"--time:220ms;--delay:1200ms\" />\n        </mask>\n        <mask id=\"hd-details\" maskUnits=\"userSpaceOnUse\" x=\"200\" y=\"180\" width=\"900\" height=\"840\" style=\"mask-type:alpha\">\n          <path class=\"hd-mask-line\" pathLength=\"1\" d=\"M370 716 C332 666 300 501 332 449 L341 503 M378 682 C356 634 377 544 407 499 L404 535 M665 855 C647 910 676 944 718 956 M713 875 C694 913 720 944 752 949\" fill=\"none\" stroke=\"white\" stroke-width=\"70\" stroke-linecap=\"round\" style=\"--time:380ms;--delay:1250ms\" />\n        </mask>\n      </defs>\n      <g fill=\"url(#hd-gold)\">\n        <path mask=\"url(#hd-left-wing)\" d=\"M682 649 C607 584 557 455 551 346 C545 290 551 231 588 230 C640 222 699 365 707 466 C680 399 645 289 599 273 C570 329 585 452 623 539 C641 586 660 622 682 649 Z\" />\n        <path mask=\"url(#hd-right-wing)\" d=\"M714 718 C697 720 690 682 687 640 C677 525 744 386 826 316 C870 278 915 265 939 293 C984 348 920 485 855 556 C827 586 802 609 777 620 C834 553 899 444 917 368 C927 324 911 307 881 319 C807 349 735 461 718 558 C710 608 716 661 731 704 Z\" />\n        <path mask=\"url(#hd-arch)\" d=\"M709 707 C775 665 822 647 871 666 C938 691 963 750 981 799 C994 837 1009 866 1031 872 L995 891 C967 866 955 828 938 787 C908 716 867 690 810 693 C769 694 743 710 720 717 Z\" />\n        <path mask=\"url(#hd-bowl)\" fill-rule=\"evenodd\" d=\"M679 750 C697 817 739 864 800 888 C787 860 790 817 814 781 C833 751 859 736 880 749 C925 777 891 861 860 892 C936 903 1005 879 1050 861 C1030 904 944 933 865 934 C770 934 700 863 679 750 Z M821 889 C845 908 871 844 867 808 C864 779 843 797 831 821 C817 849 811 878 821 889 Z\" />\n        <path mask=\"url(#hd-letters)\" d=\"M245 866 C299 867 326 818 361 755 C386 709 413 673 449 669 C492 663 528 705 537 758 C505 728 486 704 462 706 C435 709 407 747 382 802 C430 830 499 815 543 767 L561 735 C570 776 584 810 607 817 C636 827 667 792 681 751 C685 803 662 850 626 860 C588 871 565 836 552 795 C534 844 465 875 408 865 C390 862 375 855 366 849 C326 878 276 889 245 866 Z\" />\n        <path mask=\"url(#hd-crescent)\" d=\"M560 725 C552 697 573 666 608 657 C651 646 685 677 684 728 L681 748 C675 716 657 691 637 693 C609 690 590 724 560 725 Z\" />\n        <g mask=\"url(#hd-details)\">\n          <path d=\"M367 713 C333 678 310 603 307 546 C305 509 312 468 326 447 C333 436 344 455 349 475 C356 500 342 518 329 494 C314 570 341 658 374 706 Z\" />\n          <path d=\"M375 682 C352 635 363 584 378 545 C387 519 398 497 406 494 C422 490 419 528 408 535 C403 538 400 531 399 522 C374 567 369 627 383 677 Z\" />\n          <path d=\"M665 856 C684 865 692 883 687 902 C681 928 703 951 718 957 C681 955 650 931 650 899 C650 883 655 866 665 856 Z\" />\n          <path d=\"M713 876 C728 886 730 901 727 916 C727 932 740 944 753 949 C723 954 699 931 699 909 C699 896 704 883 713 876 Z\" />\n        </g>\n      </g>\n    <g class=\"hd-caption\" role=\"group\" aria-label=\"الهيثم · نحل وعسل\">\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ل\" data-type-at=\"2820\" style=\"--type-delay:2820ms\" transform=\"translate(460.64062 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M1042 73Q1120 199 1120 426V1556H1304V383Q1304 277 1353 228Q1397 184 1496 184H1571V0H1441Q1329 0 1251 51Q1233 5 1206 -35Q1085 -212 824 -278Q690 -312 605 -312Q506 -312 437 -290Q145 -199 144 75Q143 213 207 305H391Q326 190 326 75Q326 -51 492 -117Q532 -133 605 -133Q685 -133 794 -99Q968 -46 1042 73Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"س\" data-type-at=\"2730\" style=\"--type-delay:2730ms\" transform=\"translate(496.99219 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M1277 -20Q1240 -29 1205 -29Q1142 -29 1087 -4Q950 57 932 189Q884 33 788 0Q720 -24 655 -24Q557 -24 485 25Q425 65 384 138Q341 79 285 46Q209 0 110 0H-20V184H55Q154 184 198 228Q278 308 278 408V600H462V444Q462 380 506 280Q549 181 653 181Q762 181 806 303Q843 406 843 600H1027Q1027 395 1046 345Q1110 175 1220 176Q1362 178 1362 456V750H1546V408Q1546 311 1629 228Q1673 184 1772 184H1847V0H1717Q1572 0 1454 96Q1386 6 1277 -20Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ع\" data-type-at=\"2640\" style=\"--type-delay:2640ms\" transform=\"translate(539.81250 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M60 184Q221 184 423 277Q348 301 296 360Q208 460 208 600Q208 864 412 989Q537 1066 788 1066V897Q570 897 477.0 828.5Q384 760 384.0 632.5Q384 505 446 453Q529 383 599 383Q654 383 728 416L1016 545V361L596 164Q246 0 68 0H-20V184Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"و\" data-type-at=\"2550\" style=\"--type-delay:2550ms\" transform=\"translate(568.45312 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M494 452Q431 452 387 395Q363 362 363 326Q363 275 414 228Q461 184 653 184Q653 368 567 427Q530 452 494 452ZM832 184Q832 -124 660 -284Q565 -372 472 -414Q280 -500 -85 -500V-316Q274 -316 408 -240Q576 -145 638 3Q520 3 475 13Q325 46 285 80Q169 178 169 315Q169 456 258 543Q362 646 499 646Q588 646 660 595Q790 505 815 362Q832 260 832 184Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ل\" data-type-at=\"2460\" style=\"--type-delay:2460ms\" transform=\"translate(606.89062 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M1042 73Q1120 199 1120 426V1556H1304V383Q1304 277 1353 228Q1397 184 1496 184H1571V0H1441Q1329 0 1251 51Q1233 5 1206 -35Q1085 -212 824 -278Q690 -312 605 -312Q506 -312 437 -290Q145 -199 144 75Q143 213 207 305H391Q326 190 326 75Q326 -51 492 -117Q532 -133 605 -133Q685 -133 794 -99Q968 -46 1042 73Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ح\" data-type-at=\"2370\" style=\"--type-delay:2370ms\" transform=\"translate(643.24219 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M638 780Q896 728 1116 630V476Q1051 456 978 415Q1028 337 1058 303Q1162 184 1276 184H1342V0H1256Q1047 0 921 168Q881 222 822 319Q753 273 712 236Q567 107 492 80Q271 0 108 0H-20V184H80Q307 184 436 256Q540 314 656 420Q750 506 851 541Q768 564 665 587Q580 606 400 622Q318 629 157 623V807Q229 814 304 815Q466 815 638 780Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ن\" data-type-at=\"2280\" style=\"--type-delay:2280ms\" transform=\"translate(674.22656 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M224 1000H374V850H224ZM299 86Q227 0 70 0H-20V184H15Q114 184 158 228Q207 277 207 383V600H391V383Q391 196 299 86Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"·\" data-type-at=\"2190\" style=\"--type-delay:2190ms\" transform=\"translate(702.84375 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M219 838H430V584H219Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"م\" data-type-at=\"2100\" style=\"--type-delay:2100ms\" transform=\"translate(733.35938 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M610 168Q732 126 808 126Q852 126 873 148Q926 205 926 263Q926 287 920 307Q899 395 840 412Q800 424 754 424Q695 424 668 397Q600 329 600 261Q600 221 610 168ZM1048 52Q1033 38 1020 30Q887 -50 812 -50Q631 -50 490 28Q440 56 365 -22Q340 -48 340 -127V-492H140V-127Q140 46 260 148Q325 203 415 203Q413 245 413 285Q413 433 575 565Q652 628 744 628Q816 628 900 592Q1070 521 1110 342Q1125 275 1165 231Q1203 187 1308 187H1383V3H1253Q1078 3 1048 52Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ث\" data-type-at=\"2010\" style=\"--type-delay:2010ms\" transform=\"translate(765.30469 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M299 86Q222 0 70 0H-20V184H15Q114 184 158 228Q207 277 207 383V600H391V383Q391 277 440 228Q484 184 583 184H638V0H528Q378 0 299 86ZM224 1250H374V1100H224ZM349 1000H499V850H349ZM99 1000H249V850H99Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ي\" data-type-at=\"1920\" style=\"--type-delay:1920ms\" transform=\"translate(779.78906 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M299 86Q222 0 70 0H-20V184H15Q114 184 158 228Q207 277 207 383V600H391V383Q391 277 440 228Q484 184 583 184H638V0H528Q378 0 299 86ZM349 -150H499V-300H349ZM99 -150H249V-300H99Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ه\" data-type-at=\"1830\" style=\"--type-delay:1830ms\" transform=\"translate(794.27344 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M339 184H358Q400 184 496 260Q610 350 610 402Q610 514 526 514Q451 514 377 373Q339 301 339 184ZM155 184Q164 450 293 576Q401 683 530 683Q668 683 737 584Q783 517 783 403Q783 292 620 184H964V0H620Q783 -108 783 -219Q783 -333 737 -400Q668 -499 530 -499Q401 -499 293 -392Q164 -264 155 0H-20V184ZM339 0Q339 -117 377 -189Q451 -330 526 -330Q610 -330 610 -218Q610 -166 496 -76Q400 0 358 0Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ل\" data-type-at=\"1740\" style=\"--type-delay:1740ms\" transform=\"translate(816.39844 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M431 371Q431 193 344 92Q264 0 110 0H-20V184H55Q154 184 198 228Q247 277 247 383V1556H431Z\" />\n  <path class=\"hd-caption-letter\" aria-hidden=\"true\" data-letter=\"ا\" data-type-at=\"1650\" style=\"--type-delay:1650ms\" transform=\"translate(831.02344 1054.00000) scale(0.02343750 -0.02343750)\" d=\"M193 1556H377V0H193Z\" />\n</g>\n    </svg>";
  const markup = `
    <style>
      :host {
        --haytham-gold-start: #98601c;
        --haytham-gold-middle: #d7a343;
        --haytham-gold-end: #ab7228;
        --haytham-text: #594422;
        --haytham-surface: #fbf8f1;
        display: none; box-sizing: border-box; direction: rtl;
        font-family: Tahoma, Arial, sans-serif;
        color: var(--haytham-text);
      }
      :host([active]) { display: inline-grid; justify-items: center; }
      :host([hidden]) { display: none !important; }
      :host([overlay]) {
        position: fixed; inset: 0; z-index: var(--haytham-z-index, 9999);
        place-content: center; padding: 24px;
        background: var(--haytham-overlay-background, var(--haytham-surface));
      }
      .artwork { width: var(--haytham-size, 190px); max-width: 100%; }
      .hd-logo { display: block; width: 100%; height: auto; overflow: visible; }
      .hd-logo .hd-gold-start { stop-color: var(--haytham-gold-start); }
      .hd-logo .hd-gold-middle { stop-color: var(--haytham-gold-middle); }
      .hd-logo .hd-gold-end { stop-color: var(--haytham-gold-end); }
      .hd-logo .hd-caption { fill: var(--haytham-text); }
      .status { margin: 10px 0 0; text-align: center; font-size: 13px; line-height: 1.7; }
      .status:empty { display: none; }
      :host([active]) .status { animation: haytham-wait 1.4s ease-in-out infinite alternate; }
      @keyframes haytham-wait { from { opacity: .55; } to { opacity: 1; } }
      @media (prefers-color-scheme: dark) {
        :host {
          --haytham-gold-start: #c18834; --haytham-gold-middle: #f9df8a;
          --haytham-gold-end: #c9984e; --haytham-text: #e4d4b5; --haytham-surface: #191713;
        }
      }
      :host([theme="light"]) {
        --haytham-gold-start: #98601c; --haytham-gold-middle: #d7a343;
        --haytham-gold-end: #ab7228; --haytham-text: #594422; --haytham-surface: #fbf8f1;
      }
      :host([theme="dark"]) {
        --haytham-gold-start: #c18834; --haytham-gold-middle: #f9df8a;
        --haytham-gold-end: #c9984e; --haytham-text: #e4d4b5; --haytham-surface: #191713;
      }
      @media (prefers-reduced-motion: reduce) {
        :host([active]) .status { animation: none !important; }
      }
    </style>
    <div class="artwork" part="artwork">${LOGO}</div>
    <span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap">الهيثم · نحل وعسل</span>
    <p class="status" part="status" role="status" aria-live="polite" aria-atomic="true"></p>`;

  class HaythamLoader extends HTMLElement {
    static get observedAttributes() { return ['active', 'label']; }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML = markup;
    }
    connectedCallback() {
      // Preserve a property set before the component script loaded.
      if (Object.prototype.hasOwnProperty.call(this, 'active')) {
        const value = this.active;
        delete this.active;
        this.active = value;
      }
      this.updateLabel();
      if (this.active) this.replay();
    }
    attributeChangedCallback(name, before, after) {
      if (before === after) return;
      if (name === 'label') this.updateLabel();
      if (name === 'active' && this.isConnected && after !== null) this.replay();
    }
    updateLabel() {
      this.shadowRoot.querySelector('.status').textContent =
        this.getAttribute('label') ?? 'جارٍ التحميل…';
    }
    get active() { return this.hasAttribute('active'); }
    set active(value) { this.toggleAttribute('active', Boolean(value)); }
    show() { this.active = true; }
    hide() { this.active = false; }
    replay() {
      if (!this.active) return;
      const logo = this.shadowRoot.querySelector('svg');
      logo.removeAttribute('data-animate');
      void this.offsetWidth;
      logo.setAttribute('data-animate', '');
    }
  }
  customElements.define('haytham-loader', HaythamLoader);
})();

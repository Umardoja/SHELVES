'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimatedText = AnimatedText;
var framer_motion_1 = require("framer-motion");
function AnimatedText(_a) {
    var text = _a.text, className = _a.className, _b = _a.delay, delay = _b === void 0 ? 0 : _b;
    // Split text into words
    var words = text.split(" ");
    var container = {
        hidden: { opacity: 0 },
        visible: function (i) {
            if (i === void 0) { i = 1; }
            return ({
                opacity: 1,
                transition: { staggerChildren: 0.12, delayChildren: 0.04 * i + delay },
            });
        },
    };
    var child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };
    return (<framer_motion_1.motion.div style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className={className}>
      {words.map(function (word, index) { return (<framer_motion_1.motion.span variants={child} style={{ marginRight: "0.25em" }} key={index}>
          {word}
        </framer_motion_1.motion.span>); })}
    </framer_motion_1.motion.div>);
}

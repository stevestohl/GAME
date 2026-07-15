/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Contents.jsx":
/*!**************************!*\
  !*** ./src/Contents.jsx ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Contents)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");
/* harmony import */ var _features_Employee_EmployeeList_jsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./features/Employee/EmployeeList.jsx */ "./src/features/Employee/EmployeeList.jsx");
/* harmony import */ var _features_Employee_EmployeeReport_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./features/Employee/EmployeeReport.jsx */ "./src/features/Employee/EmployeeReport.jsx");
/* harmony import */ var _features_Employee_EmployeeEdit_jsx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./features/Employee/EmployeeEdit.jsx */ "./src/features/Employee/EmployeeEdit.jsx");
/* harmony import */ var _features_Flashcards_Flashcards_jsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./features/Flashcards/Flashcards.jsx */ "./src/features/Flashcards/Flashcards.jsx");
/* harmony import */ var _features_Flashcards_FlashcardsList_jsx__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./features/Flashcards/FlashcardsList.jsx */ "./src/features/Flashcards/FlashcardsList.jsx");
/* harmony import */ var _features_Flashcards_FlashcardGame_jsx__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./features/Flashcards/FlashcardGame.jsx */ "./src/features/Flashcards/FlashcardGame.jsx");
/* harmony import */ var _features_Menu_Home_jsx__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./features/Menu/Home.jsx */ "./src/features/Menu/Home.jsx");
/* harmony import */ var _features_Menu_BarHome_jsx__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./features/Menu/BarHome.jsx */ "./src/features/Menu/BarHome.jsx");
/* harmony import */ var _features_Prompt2_Prompt2GameManager_jsx__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./features/Prompt2/Prompt2GameManager.jsx */ "./src/features/Prompt2/Prompt2GameManager.jsx");
/* harmony import */ var _features_TicTacToe_TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./features/TicTacToe/TicTacToe.jsx */ "./src/features/TicTacToe/TicTacToe.jsx");
/* harmony import */ var _features_Trivia_TriviaWaitingRoom_jsx__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./features/Trivia/TriviaWaitingRoom.jsx */ "./src/features/Trivia/TriviaWaitingRoom.jsx");











// FIXED: Changed this from Prompt2Lobby to Prompt2GameManager


// --- Game Imports ---


function Contents() {
  var NotFound = function NotFound() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h1", null, "Page Not Found");
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Routes, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/home",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Menu_Home_jsx__WEBPACK_IMPORTED_MODULE_7__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/barhome",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Menu_BarHome_jsx__WEBPACK_IMPORTED_MODULE_8__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/tictactoe",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_TicTacToe_TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_10__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/TriviaWaitingRoom",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Trivia_TriviaWaitingRoom_jsx__WEBPACK_IMPORTED_MODULE_11__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/flashcards",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Flashcards_Flashcards_jsx__WEBPACK_IMPORTED_MODULE_4__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/flashcardsList",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Flashcards_FlashcardsList_jsx__WEBPACK_IMPORTED_MODULE_5__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/flashcardGame",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Flashcards_FlashcardGame_jsx__WEBPACK_IMPORTED_MODULE_6__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/prompt2",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Prompt2_Prompt2GameManager_jsx__WEBPACK_IMPORTED_MODULE_9__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/employees",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Employee_EmployeeList_jsx__WEBPACK_IMPORTED_MODULE_1__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/edit/:id",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Employee_EmployeeEdit_jsx__WEBPACK_IMPORTED_MODULE_3__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/report",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_features_Employee_EmployeeReport_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], null)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "/",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Navigate, {
      replace: true,
      to: "/home"
    })
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_12__.Route, {
    path: "*",
    element: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(NotFound, null)
  }));
}

/***/ }),

/***/ "./src/Page.jsx":
/*!**********************!*\
  !*** ./src/Page.jsx ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Page)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Navbar.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Nav.js");
/* harmony import */ var _Contents_jsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Contents.jsx */ "./src/Contents.jsx");
/* harmony import */ var _assets_logos_background_jpg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./assets/logos/background.jpg */ "./src/assets/logos/background.jpg");
/* harmony import */ var _assets_logos_temple_jpg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./assets/logos/temple.jpg */ "./src/assets/logos/temple.jpg");
/* harmony import */ var _assets_logos_MartiniLogo_jpg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./assets/logos/MartiniLogo.jpg */ "./src/assets/logos/MartiniLogo.jpg");






function NavBar() {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
    variant: "light",
    className: "justify-content-center py-0",
    style: {
      backgroundColor: "#e3f2fd"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"].Brand, {
    href: "/home"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
    src: _assets_logos_temple_jpg__WEBPACK_IMPORTED_MODULE_3__,
    alt: "Game-temple Logo",
    style: {
      maxWidth: "40px",
      height: "auto",
      mixBlendMode: "multiply"
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"].Link, {
    href: "/barhome",
    className: "py-0"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
    src: _assets_logos_MartiniLogo_jpg__WEBPACK_IMPORTED_MODULE_4__,
    alt: "Martini Logo",
    style: {
      maxWidth: "30px",
      height: "auto",
      mixBlendMode: "multiply"
    }
  }))));
}
function Page() {
  var pageStyle = {
    backgroundImage: "url(".concat(_assets_logos_background_jpg__WEBPACK_IMPORTED_MODULE_2__, ")"),
    backgroundSize: "cover",
    // Forces image to fill the screen without stretching out of proportion
    backgroundPosition: "center",
    // Centers the image horizontally and vertically
    backgroundRepeat: "no-repeat",
    // Prevents the image from repeating like a tile grid
    backgroundAttachment: "fixed",
    // Keeps the image pinned in place while content scrolls past
    minHeight: "100vh",
    // Ensures the background covers at least 100% of the screen height
    width: "100%",
    mixBlendMode: "multiply"
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: pageStyle
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(NavBar, null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_Contents_jsx__WEBPACK_IMPORTED_MODULE_1__["default"], null));
}

/***/ }),

/***/ "./src/UniversalJoinForm.jsx":
/*!***********************************!*\
  !*** ./src/UniversalJoinForm.jsx ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ UniversalJoinForm)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Form.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/InputGroup.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



function UniversalJoinForm(_ref) {
  var playerName = _ref.playerName;
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(""),
    _useState2 = _slicedToArray(_useState, 2),
    roomCode = _useState2[0],
    setRoomCode = _useState2[1];
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_1__.useNavigate)();
  var handleJoin = function handleJoin(e) {
    e.preventDefault();
    var code = roomCode.toUpperCase().trim();
    var prefix = code.charAt(0);

    // 1. Dispatcher Logic: Map prefix to path
    var path = '';
    switch (prefix) {
      case 'T':
        path = '/tictactoe';
        break;
      case 'R':
        path = '/TriviaWaitingRoom';
        break;
      case 'P':
        path = '/prompt2';
        break;
      default:
        return alert("Invalid room code format. Codes must start with T, R, or P.");
    }

    // 2. Navigate to the game
    // Pass the name and role to the game component
    navigate("".concat(path, "?room=").concat(code, "&role=guest&name=").concat(encodeURIComponent(playerName || 'Guest')));
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    onSubmit: handleJoin,
    className: "d-flex flex-column gap-2 mt-1"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    size: "md"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Control, {
    type: "text",
    placeholder: "CODE",
    value: roomCode,
    onChange: function onChange(e) {
      return setRoomCode(e.target.value);
    },
    maxLength: 4,
    className: "text-center fw-bold tracking-widest text-uppercase",
    autoComplete: "off"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    variant: "primary",
    type: "submit",
    className: "fw-bold px-3",
    disabled: roomCode.trim().length !== 4
  }, "Join")));
}

/***/ }),

/***/ "./src/employees.jsx":
/*!***************************!*\
  !*** ./src/employees.jsx ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ "./node_modules/react-dom/client.js");
/* harmony import */ var _Page_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Page.jsx */ "./src/Page.jsx");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");


// import EmployeeList from './EmployeeList.jsx'


var root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(document.getElementById('content'));
root.render( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_3__.BrowserRouter, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().StrictMode), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_Page_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], null))));

/***/ }),

/***/ "./src/features/Employee/EmployeeAdd.jsx":
/*!***********************************************!*\
  !*** ./src/features/Employee/EmployeeAdd.jsx ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EmployeeAdd)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Modal.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Container.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Row.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Col.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }


var EmployeeAdd = /*#__PURE__*/function (_React$Component) {
  _inherits(EmployeeAdd, _React$Component);
  var _super = _createSuper(EmployeeAdd);
  function EmployeeAdd() {
    var _this;
    _classCallCheck(this, EmployeeAdd);
    _this = _super.call(this);
    _this.state = {
      modalVisible: false
    };
    _this.handleSubmit = _this.handleSubmit.bind(_assertThisInitialized(_this));
    _this.handleShowModal = _this.handleShowModal.bind(_assertThisInitialized(_this));
    _this.handleHideModal = _this.handleHideModal.bind(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(EmployeeAdd, [{
    key: "handleShowModal",
    value: function handleShowModal() {
      this.setState({
        modalVisible: true
      });
    }
  }, {
    key: "handleHideModal",
    value: function handleHideModal() {
      this.setState({
        modalVisible: false
      });
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(e) {
      var form = document.forms.employeeAdd;
      var employee = {
        name: form.name.value,
        extension: form.ext.value,
        email: form.email.value,
        title: form.title.value
      };
      this.props.createEmployee(employee);
      form.name.value = '';
      form.ext.value = '';
      form.email.value = '';
      form.title.value = '';
      this.setState({
        modalVisible: false
      });
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
        className: "addEmployee"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
        variant: "primary",
        size: "zm",
        onClick: this.handleShowModal
      }, "New Employee")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
        show: this.state.modalVisible,
        onHide: this.handleHideModal,
        centered: true
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Header, {
        closeButton: true
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Title, null, "Add New Employee")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
        fluid: true
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("form", {
        name: "employeeAdd"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: 3
      }, "Name:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "name"
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: 3
      }, "Extension:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "ext",
        maxLength: 4
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: 3
      }, "Email"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "email"
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: 3
      }, "Title"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "title"
      })))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Footer, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
        type: "submit",
        variant: "success",
        size: "sm",
        onClick: this.handleSubmit
      }, "Add Employee"))));
    }
  }]);
  return EmployeeAdd;
}((react__WEBPACK_IMPORTED_MODULE_0___default().Component));


/***/ }),

/***/ "./src/features/Employee/EmployeeEdit.jsx":
/*!************************************************!*\
  !*** ./src/features/Employee/EmployeeEdit.jsx ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EmployeeEdit)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Container.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Row.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Col.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Alert.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }


var EmployeeEdit = /*#__PURE__*/function (_React$Component) {
  _inherits(EmployeeEdit, _React$Component);
  var _super = _createSuper(EmployeeEdit);
  function EmployeeEdit() {
    var _this;
    _classCallCheck(this, EmployeeEdit);
    _this = _super.call(this);
    _this.state = {
      employee: [],
      alertVisible: false,
      alertColor: 'success',
      alertMessage: ''
    };
    _this.handleSubmit = _this.handleSubmit.bind(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(EmployeeEdit, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.loadData();
    }
  }, {
    key: "loadData",
    value: function loadData() {
      var _this2 = this;
      var pathParts = window.location.pathname.split('/');
      var id = pathParts[pathParts.length - 1];
      if (!id || id === "edit" || id === "") {
        console.error("Could not parse a valid ID from the URL pathname:", window.location.pathname);
        return;
      }
      fetch("/api/employees/".concat(id)).then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP error! status: ".concat(response.status));
        }
        return response.json();
      }).then(function (data) {
        var employee = data.employee || data;
        if (employee && employee.dateHired) {
          employee.dateHired = new Date(employee.dateHired);
          _this2.setState({
            employee: employee
          });
        } else {
          console.error("Employee data format received from API is invalid:", data);
        }
      })["catch"](function (err) {
        return console.error("Error loading employee data:", err);
      });
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(e) {
      var _this3 = this;
      e.preventDefault();

      // Grab the form directly from the event target instead of the global document object
      var form = e.target;
      var id = form.id.value;
      var name = form.name.value;
      var extension = form.extension.value;
      var email = form.email.value;
      var title = form.title.value;
      var currentlyEmployed = form.currentlyEmployed.checked;
      var url = "/api/employees/".concat(id);
      fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json;charset=UTF-8' // Fixed typo here
        },

        body: JSON.stringify({
          name: name,
          extension: extension,
          email: email,
          title: title,
          currentlyEmployed: currentlyEmployed
        })
      }).then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to update employee.");
        }
        return response.json();
      }).then(function (updatedData) {
        _this3.setState({
          alertVisible: true,
          alertColor: 'success',
          alertMessage: updatedData.message || "Employee updated successfully!"
        });

        // Optionally update state or redirect the user here
      })["catch"](function (err) {
        console.error("Error updating employee:", err);
        alert("Error updating employee. Check console for details.");
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;
      var employee = this.state.employee;
      if (!employee) return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", null, "Loading...");
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Header, {
        as: "h5"
      }, "Edit ", this.state.employee.name), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Text, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
        fluid: true
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("form", {
        name: "employeeUpdate",
        onSubmit: this.handleSubmit
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, "ID"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "id",
        value: employee._id,
        readOnly: true
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, "Name:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "name",
        defaultValue: employee.name
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, "Extension:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        maxLength: "4",
        name: "extension",
        defaultValue: employee.extension
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, "Email:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "email",
        defaultValue: employee.email
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, "Title:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "title",
        defaultValue: employee.title
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, "Date Hired:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "text",
        name: "dateHired",
        value: employee.dateHired ? employee.dateHired.toDateString() : '',
        readOnly: true
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, "Currently Employed:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: "auto"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "checkbox",
        name: "currentlyEmployed",
        defaultChecked: employee.currentlyEmployed
      }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
        md: 2
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
        type: "submit",
        variant: "primary",
        size: "sm",
        value: "Update",
        className: "mt-3"
      }, "Update Employee"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
        className: "mt-3"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"], {
        variant: this.state.alertColor,
        show: this.state.alertVisible,
        onClose: function onClose() {
          return _this4.setState({
            alertVisible: false
          });
        },
        dismissible: true
      }, this.state.alertMessage))))))));
    }
  }]);
  return EmployeeEdit;
}((react__WEBPACK_IMPORTED_MODULE_0___default().Component));


/***/ }),

/***/ "./src/features/Employee/EmployeeFilter.jsx":
/*!**************************************************!*\
  !*** ./src/features/Employee/EmployeeFilter.jsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EmployeeFilter)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");



function EmployeeFilter() {
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_1__.useNavigate)();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Header, {
    as: "h5"
  }, "Filter "), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Text, null, "Currently Employed:", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("select", {
    onChange: function onChange(e) {
      return navigate(e.target.value ? "/employees?employed=".concat(e.target.value) : "/employees");
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: ""
  }, "All"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "true"
  }, "Employed"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "false"
  }, "Not Employed")))));
}

/***/ }),

/***/ "./src/features/Employee/EmployeeList.jsx":
/*!************************************************!*\
  !*** ./src/features/Employee/EmployeeList.jsx ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EmployeeList)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");
/* harmony import */ var _EmployeeFilter_jsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./EmployeeFilter.jsx */ "./src/features/Employee/EmployeeFilter.jsx");
/* harmony import */ var _EmployeeAdd_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./EmployeeAdd.jsx */ "./src/features/Employee/EmployeeAdd.jsx");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Badge.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Table.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }





function EmployeeTable(props) {
  // Get the URL
  var _useLocation = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.useLocation)(),
    search = _useLocation.search;
  // Get filter parameters from the URL
  var query = new URLSearchParams(search);
  // Get employed parameter specifically
  var q = query.get('employed');
  var employeeRows = props.employees.filter(function (employee) {
    if (q === null) return true; // no filter applied
    return String(employee.currentlyEmployed) === q;
  }).map(function (employee) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(EmployeeRow, {
      key: employee._id,
      employee: employee,
      deleteEmployee: props.deleteEmployee
    });
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"].Header, {
    as: "h5"
  }, "All Employees ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
    bg: "secondary"
  }, employeeRows.length)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"].Text, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"], {
    striped: true,
    size: "sm"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("thead", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Name"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Extension"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Email"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Title"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Date Hired"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Currently Employed?"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tbody", null, employeeRows)))));
}
function EmployeeRow(props) {
  function onDeleteClick() {
    props.deleteEmployee(props.employee._id);
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_3__.Link, {
    to: "/edit/".concat(props.employee._id)
  }, props.employee.name)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, props.employee.extension), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, props.employee.email), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, props.employee.title), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, props.employee.dateHired.toDateString()), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, props.employee.currentlyEmployed ? 'Yes' : 'No'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"], {
    variant: "danger",
    size: "sm",
    onClick: onDeleteClick
  }, "X")));
}
var EmployeeList = /*#__PURE__*/function (_React$Component) {
  _inherits(EmployeeList, _React$Component);
  var _super = _createSuper(EmployeeList);
  function EmployeeList() {
    var _this;
    _classCallCheck(this, EmployeeList);
    _this = _super.call(this);
    _this.state = {
      employees: []
    };
    _this.createEmployee = _this.createEmployee.bind(_assertThisInitialized(_this));
    _this.deleteEmployee = _this.deleteEmployee.bind(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(EmployeeList, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.loadData();
    }
  }, {
    key: "loadData",
    value: function loadData() {
      var _this2 = this;
      fetch('/api/employees').then(function (response) {
        return response.json();
      }).then(function (data) {
        data.employees.forEach(function (employee) {
          employee.dateHired = new Date(employee.dateHired);
        });
        _this2.setState({
          employees: data.employees
        });
      })["catch"](function (err) {
        console.log(err);
      });
    }
  }, {
    key: "createEmployee",
    value: function createEmployee(employee) {
      var _this3 = this;
      fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
      }).then(function (response) {
        return response.json();
      }).then(function (newEmployee) {
        newEmployee.employee.dateHired = new Date(newEmployee.employee.dateHired);
        var newEmployees = _this3.state.employees.concat(newEmployee.employee);
        _this3.setState({
          employees: newEmployees
        });
        console.log('Total count of employees:', newEmployees.length);
      })["catch"](function (err) {
        console.log(err);
      });
    }
  }, {
    key: "deleteEmployee",
    value: function deleteEmployee(id) {
      var _this4 = this;
      fetch("/api/employees/".concat(id), {
        method: 'DELETE'
      }).then(function (response) {
        if (!response.ok) {
          console.log('Failed to delete employee.');
        } else {
          _this4.loadData();
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_EmployeeAdd_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], {
        createEmployee: this.createEmployee
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_EmployeeFilter_jsx__WEBPACK_IMPORTED_MODULE_1__["default"], null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(EmployeeTable, {
        employees: this.state.employees,
        deleteEmployee: this.deleteEmployee
      }));
    }
  }]);
  return EmployeeList;
}((react__WEBPACK_IMPORTED_MODULE_0___default().Component));


/***/ }),

/***/ "./src/features/Employee/EmployeeReport.jsx":
/*!**************************************************!*\
  !*** ./src/features/Employee/EmployeeReport.jsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EmployeeReport)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");


function EmployeeReport() {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Header, {
    as: "h5"
  }, "Reports"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Text, null, "This is a place holder for the employee report.")));
}

/***/ }),

/***/ "./src/features/Flashcards/FlashcardAdd.jsx":
/*!**************************************************!*\
  !*** ./src/features/Flashcards/FlashcardAdd.jsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FlashcardAdd)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Modal.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Form.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



// 🌐 Your live Render backend base URL
var API_BASE_URL = 'https://game-temple-backend.onrender.com';
function FlashcardAdd(_ref) {
  var show = _ref.show,
    onHide = _ref.onHide,
    onDrinkAdded = _ref.onDrinkAdded;
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
      drinkName: "",
      recipe: "",
      garnish: "",
      createdByAnon: true
    }),
    _useState2 = _slicedToArray(_useState, 2),
    form = _useState2[0],
    setForm = _useState2[1];
  function handleChange(e) {
    var _e$target = e.target,
      name = _e$target.name,
      value = _e$target.value,
      type = _e$target.type,
      checked = _e$target.checked;
    setForm(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, type === "checkbox" ? checked : value));
    });
  }
  function handleSubmit() {
    return _handleSubmit.apply(this, arguments);
  }
  function _handleSubmit() {
    _handleSubmit = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return fetch("".concat(API_BASE_URL, "/api/drinks"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
              });
            case 2:
              res = _context.sent;
              _context.next = 5;
              return res.json();
            case 5:
              data = _context.sent;
              // Notify parent
              onDrinkAdded(data.drink, data.msg);

              // Reset form + close modal
              setForm({
                drinkName: "",
                recipe: "",
                garnish: "",
                createdByAnon: false
              });
              onHide();
            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _handleSubmit.apply(this, arguments);
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
    show: show,
    onHide: onHide,
    centered: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Header, {
    closeButton: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Title, null, "Add New Drink")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Label, null, "Drink Name"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Control, {
    type: "text",
    name: "drinkName",
    value: form.drinkName,
    onChange: handleChange
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Label, null, "Recipe"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Control, {
    type: "text",
    name: "recipe",
    value: form.recipe,
    onChange: handleChange
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Label, null, "Garnish"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Control, {
    type: "text",
    name: "garnish",
    value: form.garnish,
    onChange: handleChange
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Check, {
    type: "checkbox",
    label: "Anonymous?",
    name: "createdByAnon",
    checked: form.createdByAnon,
    onChange: handleChange
  })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Footer, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    variant: "success",
    size: "sm",
    onClick: handleSubmit
  }, "Add Drink")));
}

/***/ }),

/***/ "./src/features/Flashcards/FlashcardEdit.jsx":
/*!***************************************************!*\
  !*** ./src/features/Flashcards/FlashcardEdit.jsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FlashcardEdit)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Modal.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Form.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



// 🌐 Your live Render backend base URL
var API_BASE_URL = 'https://game-temple-backend.onrender.com';
function FlashcardEdit(_ref) {
  var show = _ref.show,
    drinkData = _ref.drinkData,
    onHide = _ref.onHide,
    onDrinkUpdated = _ref.onDrinkUpdated;
  // 1. Initialize local form state (Using correct boolean defaults)
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(""),
    _useState2 = _slicedToArray(_useState, 2),
    drinkName = _useState2[0],
    setDrinkName = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(""),
    _useState4 = _slicedToArray(_useState3, 2),
    recipe = _useState4[0],
    setRecipe = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(""),
    _useState6 = _slicedToArray(_useState5, 2),
    garnish = _useState6[0],
    setGarnish = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState8 = _slicedToArray(_useState7, 2),
    createdByAnon = _useState8[0],
    setCreatedByAnon = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState10 = _slicedToArray(_useState9, 2),
    isSubmitting = _useState10[0],
    setIsSubmitting = _useState10[1];

  // 2. Watch for changes to drinkData
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    if (drinkData) {
      setDrinkName(drinkData.drinkName || "");
      setRecipe(drinkData.recipe || "");
      setGarnish(drinkData.garnish || "");
      setCreatedByAnon(drinkData.createdByAnon || false);
    }
  }, [drinkData]);

  // 3. Handle form submission
  var handleSubmit = function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    var updatePayload = {
      drinkName: drinkName.trim(),
      recipe: recipe.trim(),
      garnish: garnish.trim(),
      createdByAnon: createdByAnon
    };

    // 🔄 Updated to target Render instead of a relative path
    fetch("".concat(API_BASE_URL, "/api/drinks/").concat(drinkData._id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    }).then(function (res) {
      if (!res.ok) throw new Error("Failed to update the drink.");
      return res.json();
    }).then(function (data) {
      var finalUpdatedDrink = data.drink || _objectSpread(_objectSpread({}, drinkData), updatePayload);
      onDrinkUpdated(finalUpdatedDrink);
    })["catch"](function (err) {
      console.error("Error updating drink:", err);
      alert("Something went wrong updating the drink. Check the console.");
    })["finally"](function () {
      setIsSubmitting(false);
    });
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
    show: show,
    onHide: onHide,
    centered: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Header, {
    closeButton: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Title, {
    className: "fw-bold text-secondary"
  }, "Edit: ", drinkData === null || drinkData === void 0 ? void 0 : drinkData.drinkName)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    onSubmit: handleSubmit
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3",
    controlId: "editDrinkName"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Label, {
    className: "fw-semibold"
  }, "Drink Name"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Control, {
    type: "text",
    required: true,
    value: drinkName,
    onChange: function onChange(e) {
      return setDrinkName(e.target.value);
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3",
    controlId: "editDrinkRecipe"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Label, {
    className: "fw-semibold"
  }, "Drink Recipe"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Control, {
    as: "textarea",
    rows: 3,
    required: true,
    value: recipe,
    onChange: function onChange(e) {
      return setRecipe(e.target.value);
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3",
    controlId: "editDrinkGarnish"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Label, {
    className: "fw-semibold"
  }, "Garnish"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Control, {
    type: "text",
    value: garnish,
    onChange: function onChange(e) {
      return setGarnish(e.target.value);
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Group, {
    className: "mb-3",
    controlId: "editCreatedByAnon"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Check, {
    type: "checkbox",
    label: "Post as Anonymous User",
    checked: createdByAnon,
    onChange: function onChange(e) {
      return setCreatedByAnon(e.target.checked);
    }
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Footer, {
    className: "bg-light"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    variant: "outline-secondary",
    onClick: onHide,
    disabled: isSubmitting
  }, "Cancel"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    variant: "primary",
    type: "submit",
    disabled: isSubmitting
  }, isSubmitting ? "Saving..." : "Save Changes"))));
}

/***/ }),

/***/ "./src/features/Flashcards/FlashcardGame.jsx":
/*!***************************************************!*\
  !*** ./src/features/Flashcards/FlashcardGame.jsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FlashcardGame)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Form.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }



// 🌐 Your live Render backend base URL
var API_BASE_URL = 'https://game-temple-backend.onrender.com';
function FlashcardGame() {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState2 = _slicedToArray(_useState, 2),
    allDrinks = _useState2[0],
    setAllDrinks = _useState2[1]; // Raw pool from API
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(1),
    _useState4 = _slicedToArray(_useState3, 2),
    round = _useState4[0],
    setRound = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0),
    _useState6 = _slicedToArray(_useState5, 2),
    score = _useState6[0],
    setScore = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState8 = _slicedToArray(_useState7, 2),
    options = _useState8[0],
    setOptions = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState10 = _slicedToArray(_useState9, 2),
    correctDrink = _useState10[0],
    setCorrectDrink = _useState10[1];
  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("default"),
    _useState12 = _slicedToArray(_useState11, 2),
    filterMode = _useState12[0],
    setFilterMode = _useState12[1]; // "default" or "all"
  var TOTAL_ROUNDS = 10;
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    // 🔄 Updated to target Render instead of a relative path
    fetch("".concat(API_BASE_URL, "/api/drinks")).then(function (res) {
      return res.json();
    }).then(function (data) {
      return setAllDrinks(data.drinks || []);
    });
  }, []);

  // COMPUTED ARRAY: Dynamic pool based on selected deck mode
  var visibleDrinks = allDrinks.filter(function (drink) {
    if (filterMode === "default") {
      return drink.isDefault === true;
    }
    return true;
  });

  // Restarts or updates round when pool changes or round increments
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    if (visibleDrinks.length > 0) {
      startRound();
    }
  }, [allDrinks, filterMode, round]); // Added filterMode to dependencies to trigger reload on switch

  function startRound() {
    if (visibleDrinks.length === 0) return;

    // Shuffle current active pool
    var shuffled = _toConsumableArray(visibleDrinks).sort(function () {
      return Math.random() - 0.5;
    });

    // Dynamically slice depending on pool availability (max 6 options)
    var count = Math.min(6, shuffled.length);
    var gameChoices = shuffled.slice(0, count);

    // Choose 1 correct target answer from the selection pool
    var correct = gameChoices[Math.floor(Math.random() * gameChoices.length)];
    setOptions(gameChoices);
    setCorrectDrink(correct);
  }
  function handleFilterChange(mode) {
    setFilterMode(mode);
    setRound(1); // Reset game state
    setScore(0);
  }
  function handleGuess(drink) {
    var currentScore = score;
    if (drink._id === correctDrink._id) {
      setScore(function (prev) {
        return prev + 1;
      });
      currentScore += 1;
    }
    if (round < TOTAL_ROUNDS) {
      setRound(function (prev) {
        return prev + 1;
      });
    } else {
      alert("Game over! You scored ".concat(currentScore, " out of ").concat(TOTAL_ROUNDS));
      setRound(1); // Automatically reset the loop
      setScore(0);
    }
  }
  if (visibleDrinks.length === 0) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "d-flex justify-content-center align-items-center p-3"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
      className: "text-center p-4 shadow-lg border-0",
      style: {
        maxWidth: "450px",
        width: "100%"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "mb-2 fw-semibold text-muted"
    }, "No items found in this deck."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
      variant: "primary",
      onClick: function onClick() {
        return handleFilterChange("all");
      }
    }, "Switch to All Decks")));
  }
  if (!correctDrink) return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-center mt-5 text-white"
  }, "Loading game...");
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
    className: "text-center shadow-lg border-0",
    style: {
      maxWidth: "450px",
      width: "100%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Header, {
    as: "h5",
    className: "bg-primary text-white py-3 fw-bold tracking-wide d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, "FLASHCARD QUIZ"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex gap-3 fs-6 fw-normal text-start"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Check, {
    type: "radio",
    label: "Default Cards",
    name: "gameFilter",
    id: "game-default",
    checked: filterMode === "default",
    onChange: function onChange() {
      return handleFilterChange("default");
    },
    className: "text-white custom-game-radio"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Check, {
    type: "radio",
    label: "All Cards",
    name: "gameFilter",
    id: "game-all",
    checked: filterMode === "all",
    onChange: function onChange() {
      return handleFilterChange("all");
    },
    className: "text-white custom-game-radio"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h4", {
    className: "mt-3"
  }, "Round ", round, " / ", TOTAL_ROUNDS), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h5", null, "Score: ", score), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex flex-wrap justify-content-center gap-2 px-2 my-2"
  }, options.map(function (drink) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
      key: drink._id,
      variant: "outline-primary",
      style: {
        width: "45%"
      },
      onClick: function onClick() {
        return handleGuess(drink);
      }
    }, drink.drinkName);
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
    className: "m-3 p-2 bg-body-secondary border-0 shadow-sm rounded-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Header, {
    className: "bg-transparent border-0 py-1"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h6", {
    className: "fw-bold mb-0 text-secondary text-start"
  }, "Recipe:")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Body, {
    className: "py-2"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      whiteSpace: "pre-line"
    },
    className: "ps-2 mb-0 text-muted text-start fs-6"
  }, correctDrink.recipe ? correctDrink.recipe.replaceAll(',', ',\n') : "No details listed.")))));
}

/***/ }),

/***/ "./src/features/Flashcards/Flashcards.jsx":
/*!************************************************!*\
  !*** ./src/features/Flashcards/Flashcards.jsx ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Flashcards)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Form.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

 // Importing Form for React-Bootstrap radios

// 🌐 Your live Render backend base URL
var API_BASE_URL = 'https://game-temple-backend.onrender.com';
function Flashcards() {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState2 = _slicedToArray(_useState, 2),
    allDrinks = _useState2[0],
    setAllDrinks = _useState2[1]; // Holds raw API array
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0),
    _useState4 = _slicedToArray(_useState3, 2),
    index = _useState4[0],
    setIndex = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState6 = _slicedToArray(_useState5, 2),
    flipped = _useState6[0],
    setFlipped = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("default"),
    _useState8 = _slicedToArray(_useState7, 2),
    filterMode = _useState8[0],
    setFilterMode = _useState8[1]; // Options: "default" or "all"

  // Load drinks on mount
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    function loadDrinks() {
      return _loadDrinks.apply(this, arguments);
    }
    function _loadDrinks() {
      _loadDrinks = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var res, data;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch("".concat(API_BASE_URL, "/api/drinks"));
              case 2:
                res = _context.sent;
                _context.next = 5;
                return res.json();
              case 5:
                data = _context.sent;
                setAllDrinks(data.drinks || []);
              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _loadDrinks.apply(this, arguments);
    }
    loadDrinks();
  }, []);

  // COMPUTED ARRAY: Dynamically filters based on our radio button selection
  var visibleDrinks = allDrinks.filter(function (drink) {
    if (filterMode === "default") {
      return drink.isDefault === true;
    }
    return true; // "all" mode returns everything
  });

  // Current drink pulled from the filtered array
  var drink = visibleDrinks[index];

  // Safely handle changing the radio filters
  var handleFilterChange = function handleFilterChange(mode) {
    setFilterMode(mode);
    setIndex(0); // Reset index to prevent out-of-bounds errors
    setFlipped(false); // Reset flip state
  };

  var handleFlip = function handleFlip() {
    return setFlipped(!flipped);
  };
  var handleNext = function handleNext() {
    if (visibleDrinks.length === 0) return;
    setIndex(function (prev) {
      return (prev + 1) % visibleDrinks.length;
    });
    setFlipped(false);
  };
  var handlePrev = function handlePrev() {
    if (visibleDrinks.length === 0) return;
    setIndex(function (prev) {
      return (prev - 1 + visibleDrinks.length) % visibleDrinks.length;
    });
    setFlipped(false);
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("style", null, "\n        .flashcard-wrapper {\n          display: flex;\n          flex-direction: column;\n          justify-content: center;\n          align-items: center;\n          height: calc(100vh - 80px);\n          color: rgb(203, 143, 252);\n          font-family: Arial;\n        }\n\n        /* Radio Toggle Container Style */\n        .filter-container {\n          background: rgba(255, 255, 255, 0.9);\n          padding: 10px 20px;\n          border-radius: 30px;\n          margin-bottom: 25px;\n          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);\n          color: #333;\n          display: flex;\n          gap: 20px;\n        }\n\n        #card {\n          position: relative;\n          width: 400px;\n          height: 250px;\n          perspective: 1000px;\n        }\n\n        .front, .back {\n          position: absolute;\n          width: 100%;\n          height: 100%;\n          border-radius: 20px;\n          background: #3c89fd;\n          color: white;\n          display: flex;\n          justify-content: center;\n          align-items: center;\n          backface-visibility: hidden;\n          transition: transform 0.6s;\n          padding: 20px;\n          text-align: center;\n          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\n        }\n\n        .back {\n          transform: rotateY(180deg);\n          flex-direction: column; /* Changed to column to sit title above list nicely */\n          justify-content: center;\n          align-items: center;\n          text-align: left;\n          gap: 10px;\n        }\n\n        .recipe-list {\n          margin: 0;\n          padding-left: 20px;\n        }\n\n        #card.flipped .front {\n          transform: rotateY(180deg);\n        }\n\n        #card.flipped .back {\n          transform: rotateY(0deg);\n        }\n\n        .controls {\n          margin-top: 20px;\n          display: flex;\n          gap: 20px;\n        }\n\n        button {\n          padding: 10px 20px;\n          border: none;\n          background: white;\n          color: #3c89fd;\n          border-radius: 8px;\n          font-size: 1rem;\n          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\n          cursor: pointer;\n        }\n      "), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "flashcard-wrapper"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "filter-container"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Check, {
    type: "radio",
    label: "Default Cards",
    name: "filterMode",
    id: "filter-default",
    checked: filterMode === "default",
    onChange: function onChange() {
      return handleFilterChange("default");
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Check, {
    type: "radio",
    label: "All Cards",
    name: "filterMode",
    id: "filter-all",
    checked: filterMode === "all",
    onChange: function onChange() {
      return handleFilterChange("all");
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    id: "card",
    className: flipped ? "flipped" : ""
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "front"
  }, visibleDrinks.length === 0 ? "No cards found..." : drink ? drink.drinkName : "Loading..."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "back"
  }, drink && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "recipe-title fw-bold border-bottom pb-1 mb-1"
  }, drink.drinkName), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ul", {
    className: "recipe-list"
  }, drink.recipe ? drink.recipe.split(",").map(function (item, i) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", {
      key: i
    }, item.trim());
  }) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, "No recipe found"))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "controls"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    onClick: handlePrev
  }, "\u25C0"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    onClick: handleFlip
  }, "Flip"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    onClick: handleNext
  }, "\u25B6"))));
}

/***/ }),

/***/ "./src/features/Flashcards/FlashcardsList.jsx":
/*!****************************************************!*\
  !*** ./src/features/Flashcards/FlashcardsList.jsx ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FlashcardsList)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Badge.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Table.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Toast.js");
/* harmony import */ var _FlashcardAdd_jsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./FlashcardAdd.jsx */ "./src/features/Flashcards/FlashcardAdd.jsx");
/* harmony import */ var _FlashcardEdit_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./FlashcardEdit.jsx */ "./src/features/Flashcards/FlashcardEdit.jsx");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }





// 🌐 Your live Render backend base URL
var API_BASE_URL = 'https://game-temple-backend.onrender.com';
function FlashcardsList() {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(""),
    _useState2 = _slicedToArray(_useState, 2),
    toastMessage = _useState2[0],
    setToastMessage = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState4 = _slicedToArray(_useState3, 2),
    showToast = _useState4[0],
    setShowToast = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState6 = _slicedToArray(_useState5, 2),
    drinks = _useState6[0],
    setDrinks = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState8 = _slicedToArray(_useState7, 2),
    showAddModal = _useState8[0],
    setShowAddModal = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState10 = _slicedToArray(_useState9, 2),
    currentEditingDrink = _useState10[0],
    setCurrentEditingDrink = _useState10[1];
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    // 🔄 Updated to target Render instead of relative pathing
    fetch("".concat(API_BASE_URL, "/api/drinks")).then(function (res) {
      return res.json();
    }).then(function (data) {
      return setDrinks(data.drinks || []);
    })["catch"](function (err) {
      return console.error("Error fetching drinks:", err);
    });
  }, []);

  // Called by FlashcardAdd.jsx after successful POST
  function handleDrinkAdded(newDrink, msg) {
    setDrinks(function (prev) {
      return [].concat(_toConsumableArray(prev), [newDrink]);
    });
    setToastMessage(msg);
    setShowToast(true);
  }
  var handleDeleteDrink = function handleDeleteDrink(id) {
    setDrinks(function (prev) {
      return prev.filter(function (drink) {
        return drink._id !== id;
      });
    });
    setToastMessage("Drink removed successfully!");
    setShowToast(true);

    // 🔄 Updated to route the DELETE request to Render
    fetch("".concat(API_BASE_URL, "/api/drinks/").concat(id), {
      method: 'DELETE'
    }).then(function (res) {
      return res.json();
    }).then(function (data) {
      return console.log("Delete confirmation:", data);
    })["catch"](function (err) {
      return console.error("Error deleting drink:", err);
    });
  };
  var drinkRows = drinks.map(function (drink) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", {
      key: drink._id
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      className: "align-middle"
    }, drink.isDefault ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "fw-semibold text-dark"
    }, drink.drinkName) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
      variant: "link",
      className: "p-0 text-decoration-none fw-semibold text-start",
      onClick: function onClick() {
        return setCurrentEditingDrink(drink);
      }
    }, drink.drinkName)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      className: "align-middle"
    }, drink.recipe), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      className: "align-middle"
    }, drink.garnish), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      className: "align-middle"
    }, drink.isDefault ? "Default" : drink.createdByAnon ? "Anonymous" : "User"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      className: "text-center align-middle"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
      variant: drink.isDefault ? 'secondary' : 'danger',
      size: "sm",
      disabled: drink.isDefault,
      onClick: function onClick() {
        return handleDeleteDrink(drink._id);
      }
    }, "X")));
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    className: "shadow-lg border-0"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"].Header, {
    as: "h5",
    className: "d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, "Flashcards List ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
    bg: "secondary"
  }, drinkRows.length)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    variant: "primary",
    size: "sm",
    onClick: function onClick() {
      return setShowAddModal(true);
    }
  }, "Add Drink")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"].Body, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"], {
    striped: true,
    size: "sm",
    responsive: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("thead", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Drink Name"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Drink Recipe"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Garnish"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", null, "Created"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", {
    className: "text-center"
  }, "Delete"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tbody", null, drinkRows)))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FlashcardAdd_jsx__WEBPACK_IMPORTED_MODULE_1__["default"], {
    show: showAddModal,
    onHide: function onHide() {
      return setShowAddModal(false);
    },
    onDrinkAdded: handleDrinkAdded
  }), currentEditingDrink && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_FlashcardEdit_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], {
    show: Boolean(currentEditingDrink),
    drinkData: currentEditingDrink,
    onHide: function onHide() {
      return setCurrentEditingDrink(null);
    },
    onDrinkUpdated: function onDrinkUpdated(updatedDrink) {
      setDrinks(function (prev) {
        return prev.map(function (d) {
          return d._id === updatedDrink._id ? updatedDrink : d;
        });
      });
      setToastMessage("Drink updated successfully!");
      setShowToast(true);
      setCurrentEditingDrink(null);
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"], {
    onClose: function onClose() {
      return setShowToast(false);
    },
    show: showToast,
    delay: 3000,
    autohide: true,
    bg: "success",
    style: {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"].Header, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", {
    className: "me-auto"
  }, "Success")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"].Body, {
    className: "text-white"
  }, toastMessage)));
}

/***/ }),

/***/ "./src/features/Menu/BarHome.jsx":
/*!***************************************!*\
  !*** ./src/features/Menu/BarHome.jsx ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BarHome)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Row.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Col.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");



// import gameLogo from "../src/assets/logos/Logo_Temple_Table.jpg";
//import martini from '../src/assets/logos/MartiniLogo.jpg'

function BarHome() {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
    className: "text-center shadow-lg border-0",
    style: {
      maxWidth: "450px",
      width: "100%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Header, {
    as: "h5",
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    }
  }, "BAR-TEMPLE"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Body, {
    className: "p-1"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "my-1 bg-white p-2 rounded-3 d-inline-block shadow-lg"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
    src: "https://game-temple.org/MartiniLogo.gif",
    alt: "Animated Game-Temple Logo",
    style: {
      maxWidth: "130px",
      height: "auto"
    }
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"], {
    className: "border p-1 bg-body-secondary shadow-sm rounded-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"].Title, {
    className: "text-muted text-center fw-bold small mb-1 tracking-wider"
  }, "Bartending"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    className: "g-2"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    xs: 6,
    className: "d-grid"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    variant: "primary",
    size: "lg",
    href: "/FlashcardGame",
    className: "fw-semibold align-items-center justify-content-center"
  }, "Drink Quiz ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "\uD83C\uDF79\uD83C\uDF79")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    xs: 6,
    className: "d-grid"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    variant: "primary",
    size: "lg",
    href: "/FlashcardsList",
    className: "fw-semibold align-items-center justify-content-center"
  }, "Flashcard List")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    xs: 6,
    className: "d-grid"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    variant: "primary",
    size: "lg",
    href: "/Flashcards",
    className: "fw-semibold align-items-center justify-content-center"
  }, "Flashcards")))))));
}

/***/ }),

/***/ "./src/features/Menu/Home.jsx":
/*!************************************!*\
  !*** ./src/features/Menu/Home.jsx ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Home)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Form.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Row.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Col.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Modal.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Spinner.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");
/* harmony import */ var _UniversalJoinForm_jsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../UniversalJoinForm.jsx */ "./src/UniversalJoinForm.jsx");
/* harmony import */ var _funnyNames_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../funnyNames.js */ "./src/funnyNames.js");
/* harmony import */ var _Trivia_TriviaCreateButton_jsx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Trivia/TriviaCreateButton.jsx */ "./src/features/Trivia/TriviaCreateButton.jsx");
/* harmony import */ var _TicTacToe_TicTacToeCreateButton_jsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../TicTacToe/TicTacToeCreateButton.jsx */ "./src/features/TicTacToe/TicTacToeCreateButton.jsx");
/* harmony import */ var _Prompt2_Prompt2CreateButton_jsx__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Prompt2/Prompt2CreateButton.jsx */ "./src/features/Prompt2/Prompt2CreateButton.jsx");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }






// helper functions for creating rooms and socket ID's




// ROOMCODES ARE GENERATED IN EACH INDIVIDULE Nampsapce socket for each app
function Home() {
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(_funnyNames_js__WEBPACK_IMPORTED_MODULE_2__.getRandomFunnyName),
    _useState2 = _slicedToArray(_useState, 2),
    playerName = _useState2[0],
    setPlayerName = _useState2[1];
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_6__.useNavigate)();

  //Loading state for TicTacToe Room Creation
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isCreatingRoom = _useState4[0],
    setIsCreatingRoom = _useState4[1];

  // Navigate straight to the game board
  //navigate(`/tictactoe?room=${newRoomCode}&role=host&name=${encodeURIComponent(nameToUse)}`);

  return (
    /*#__PURE__*/
    /* Match outer layout and padding of BarHome */
    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "d-flex justify-content-center align-items-center p-1"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"], {
      className: "text-center shadow-lg border-0",
      style: {
        maxWidth: "450px",
        width: "100%"
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"].Header, {
      as: "h5",
      className: "d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6",
      style: {
        backgroundColor: '#014eb6',
        color: '#f1f2f5',
        letterSpacing: '0.2em'
      }
    }, "GAME-TEMPLE.ORG"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"].Body, {
      className: "p-1"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "my-1 bg-white p-2 rounded-3 d-inline-block shadow-lg"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
      src: "https://game-temple.org/Game_Temple_Animated.gif",
      alt: "Animated Game-Temple Logo",
      style: {
        maxWidth: "130px",
        height: "auto"
      }
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"], {
      className: "border p-1 bg-body-secondary shadow-sm rounded-3"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__["default"].Title, {
      className: "text-muted text-center fw-bold small mb-1 tracking-wider"
    }, "Multi-Player Games"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("hr", {
      className: "my-1 text-muted opacity-25"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__["default"].Group, {
      className: "mb-3 text-start",
      controlId: "formPlayerName"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__["default"].Label, {
      className: "fw-bold text-muted small mb-1"
    }, "Player Name"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__["default"].Control, {
      type: "text",
      placeholder: "",
      value: playerName,
      onChange: function onChange(e) {
        return setPlayerName(e.target.value);
      },
      autoComplete: "off",
      className: "py-2"
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_9__["default"], {
      className: "g-2"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
      xs: 12,
      className: "text-start"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__["default"].Label, {
      className: "fw-bold text-muted small mb-1 ps-1"
    }, "Join Active Room"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_UniversalJoinForm_jsx__WEBPACK_IMPORTED_MODULE_1__["default"], {
      playerName: playerName
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
      xs: 12,
      className: "d-flex align-items-center mt-1 mb-0"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("hr", {
      className: "flex-grow-1 my-0 opacity-25"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "mx-2 my-2 text-muted small fw-bold text-center"
    }, "OR ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "Create New Room"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("hr", {
      className: "flex-grow-1 my-0 opacity-25"
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
      xs: 12
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_9__["default"], {
      className: "g-2"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
      xs: 6
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"], {
      variant: "primary",
      className: "fw-bold w-100 h-100 py-2 shadow-sm",
      disabled: isCreatingRoom,
      onClick: function onClick() {
        return (0,_TicTacToe_TicTacToeCreateButton_jsx__WEBPACK_IMPORTED_MODULE_4__.handleCreateTttRoom)(playerName, navigate, setIsCreatingRoom);
      }
    }, "Tic-Tac-Toe", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "X O")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
      xs: 6
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"], {
      variant: "primary",
      className: "fw-bold w-100 h-100 py-2 shadow-sm text-white",
      disabled: isCreatingRoom,
      onClick: function onClick() {
        return (0,_Trivia_TriviaCreateButton_jsx__WEBPACK_IMPORTED_MODULE_3__.handleCreateTriviaRoom)(playerName, navigate, setIsCreatingRoom);
      }
    }, "Trivia ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "\u2754\u2754")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
      xs: 6
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"], {
      variant: "primary",
      className: "fw-bold w-100 h-100 py-2 shadow-sm text-white",
      onClick: function onClick() {
        return (0,_Prompt2_Prompt2CreateButton_jsx__WEBPACK_IMPORTED_MODULE_5__.handleCreatePrompt2Room)(playerName, navigate);
      }
    }, "Prompt ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "2")))))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"], {
      show: isCreatingRoom,
      backdrop: "static",
      keyboard: false,
      centered: true
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"].Body, {
      className: "d-flex flex-column align-items-center justify-content-center p-4"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_13__["default"], {
      animation: "border",
      variant: "primary",
      className: "mb-3"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h4", {
      className: "fw-bold text-dark"
    }, "Creating Room..."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "text-muted small mb-0"
    }, "Waking up game server..."))))
  );
}

/***/ }),

/***/ "./src/features/Prompt2/Prompt2CreateButton.jsx":
/*!******************************************************!*\
  !*** ./src/features/Prompt2/Prompt2CreateButton.jsx ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "handleCreatePrompt2Room": () => (/* binding */ handleCreatePrompt2Room)
/* harmony export */ });
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../socket */ "./src/socket.js");

function handleCreatePrompt2Room(playerName, navigate) {
  var cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
  console.log("Request Prompt2 Room creation for ".concat(cleanName));
  if (!_socket__WEBPACK_IMPORTED_MODULE_0__.prompt2Socket.connected) {
    console.warn("Prompt2Socket socket is disconnected! Connecting...");
    _socket__WEBPACK_IMPORTED_MODULE_0__.prompt2Socket.connect();
  }
  _socket__WEBPACK_IMPORTED_MODULE_0__.prompt2Socket.off('roomcreated');

  // Create the room/event
  _socket__WEBPACK_IMPORTED_MODULE_0__.prompt2Socket.emit('createRoom');
  _socket__WEBPACK_IMPORTED_MODULE_0__.prompt2Socket.once('roomcreated', function (_ref) {
    var roomCode = _ref.roomCode;
    console.log("Prompt2 room created successfully! Code: ".concat(roomCode));
    // FIXED: Route changed from /TriviaWaitingRoom to /prompt2
    navigate("/prompt2?room=".concat(roomCode, "&role=host&name=").concat(encodeURIComponent(cleanName)));
  });
}

/***/ }),

/***/ "./src/features/Prompt2/Prompt2GameManager.jsx":
/*!*****************************************************!*\
  !*** ./src/features/Prompt2/Prompt2GameManager.jsx ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Prompt2GameManager)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");
/* harmony import */ var _Prompt2Lobby__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Prompt2Lobby */ "./src/features/Prompt2/Prompt2Lobby.jsx");
/* harmony import */ var _Prompt2RulesScreen_jsx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Prompt2RulesScreen.jsx */ "./src/features/Prompt2/Prompt2RulesScreen.jsx");
/* harmony import */ var _Prompt2PromptSelectionScreen_jsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Prompt2PromptSelectionScreen.jsx */ "./src/features/Prompt2/Prompt2PromptSelectionScreen.jsx");
/* harmony import */ var _Prompt2ResponseSelectionScreen__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Prompt2ResponseSelectionScreen */ "./src/features/Prompt2/Prompt2ResponseSelectionScreen.jsx");
/* harmony import */ var _Prompt2JudgingScreen_jsx__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Prompt2JudgingScreen.jsx */ "./src/features/Prompt2/Prompt2JudgingScreen.jsx");
/* harmony import */ var _Prompt2JudgingScreen_jsx__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_Prompt2JudgingScreen_jsx__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _Prompt2Scoreboard_jsx__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Prompt2Scoreboard.jsx */ "./src/features/Prompt2/Prompt2Scoreboard.jsx");
/* harmony import */ var _Prompt2Scoreboard_jsx__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_Prompt2Scoreboard_jsx__WEBPACK_IMPORTED_MODULE_7__);
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }









function Prompt2GameManager() {
  var _roomData$players$soc;
  var _useSearchParams = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_8__.useSearchParams)(),
    _useSearchParams2 = _slicedToArray(_useSearchParams, 1),
    searchParams = _useSearchParams2[0];
  var name = searchParams.get('name') || 'Anonymous';
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(searchParams.get('room') || ''),
    _useState2 = _slicedToArray(_useState, 2),
    roomCode = _useState2[0],
    setRoomCode = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState4 = _slicedToArray(_useState3, 2),
    roomData = _useState4[0],
    setRoomData = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('setup'),
    _useState6 = _slicedToArray(_useState5, 2),
    gameState = _useState6[0],
    setGameState = _useState6[1];

  // Game-specific payloads received from backend events
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState8 = _slicedToArray(_useState7, 2),
    promptOptions = _useState8[0],
    setPromptOptions = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState10 = _slicedToArray(_useState9, 2),
    currentPrompt = _useState10[0],
    setCurrentPrompt = _useState10[1];
  var _useState11 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState12 = _slicedToArray(_useState11, 2),
    submissions = _useState12[0],
    setSubmissions = _useState12[1];
  var _useState13 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState14 = _slicedToArray(_useState13, 2),
    roundResults = _useState14[0],
    setRoundResults = _useState14[1];
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    console.log("[GameManager] Mounting and establishing socket connection...");
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.connect();

    // Join room cleanly on mount using synchronized backend keys
    if (roomCode && name) {
      console.log("[GameManager] Emitting joinRoom for room: ".concat(roomCode, ", player: ").concat(name));
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.emit('joinRoom', {
        roomCode: roomCode,
        playerName: name
      });
    }

    // Centralized room listener (Handles state transitions globally)
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.on('room_updated', function (data) {
      console.log("[GameManager] room_updated state received:", data);
      setRoomData(data);
      if (data.roomCode) {
        setRoomCode(data.roomCode);
      }
      if (data.gameState) {
        setGameState(data.gameState);
      }
    });

    // Step 1: Host chooses a prompt
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.on('prompt_options', function (data) {
      setPromptOptions(data.prompts);
      setGameState('prompt_selection');
    });

    // Step 2: Everyone writes/chooses an answer
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.on('writing_phase_started', function (data) {
      setCurrentPrompt(data.prompt);
      setGameState('writing');
    });

    // Step 3: Host judges anonymous submissions
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.on('start_judging', function (data) {
      setSubmissions(data.submissions);
      setGameState('judging');
    });

    // Step 4: Show scoreboard and round winner
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.on('round_ended', function (data) {
      setRoundResults(data);
      setGameState('scoreboard');
    });

    // Cleanup tracking listeners on component unmount
    return function () {
      console.log("[GameManager] Cleaning up socket listeners...");
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.off('room_updated');
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.off('prompt_options');
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.off('writing_phase_started');
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.off('start_judging');
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.off('round_ended');
    };
  }, [roomCode, name]);

  // Strictly verify host identity using the socket context data structures
  var isHost = (roomData === null || roomData === void 0 ? void 0 : roomData.hostId) === _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.id || (roomData === null || roomData === void 0 ? void 0 : (_roomData$players$soc = roomData.players[_socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.id]) === null || _roomData$players$soc === void 0 ? void 0 : _roomData$players$soc.isPlayerHost) === true;

  // Extract array format out of raw room object data safely for map components
  var playersArray = roomData && roomData.players ? Object.values(roomData.players) : [];

  // =========================================================================
  // NEW SOCKET HANDLERS 
  // (Note: Make sure these event names match what your Node.js backend expects!)
  // =========================================================================

  // Handler for when the Host clicks on a prompt
  var handleSelectPrompt = function handleSelectPrompt(selectedPrompt) {
    console.log("[GameManager] Host selected prompt: \"".concat(selectedPrompt, "\". Emitting 'select_prompt'..."));
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.emit('selectPrompt', {
      roomCode: roomCode,
      prompt: selectedPrompt
    });
  };

  // Handler for when a Player submits their response text
  var handleSubmitResponse = function handleSubmitResponse(responseChoice) {
    console.log("[GameManager] Player submitting response: \"".concat(responseChoice, "\". Emitting 'submit_response'..."));
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.emit('submitResponse', {
      roomCode: roomCode,
      response: responseChoice
    });
  };

  // Handler for when the Host decides to reveal the choices to the lobby
  var handleRevealChoices = function handleRevealChoices() {
    console.log("[GameManager] Host revealing choices. Emitting 'reveal_choices'...");
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.emit('revealChoices', {
      roomCode: roomCode
    });
  };

  // =========================================================================

  // Direct conditional screen rendering based on engine gameState state
  switch (gameState) {
    case 'setup':
    case 'lobby':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_Prompt2Lobby__WEBPACK_IMPORTED_MODULE_2__["default"], {
        roomCode: roomCode,
        players: playersArray,
        isHost: isHost
      });
    case 'rules':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_Prompt2RulesScreen_jsx__WEBPACK_IMPORTED_MODULE_3__["default"], {
        roomCode: roomCode,
        isHost: isHost
      });
    case 'prompt_selection':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_Prompt2PromptSelectionScreen_jsx__WEBPACK_IMPORTED_MODULE_4__["default"], {
        roomCode: roomCode,
        isHost: isHost,
        options: promptOptions,
        onSelectPrompt: handleSelectPrompt // Pass the missing prop handler!
      });

    case 'writing':
      // Count players who aren't the host
      var activePlayers = playersArray.filter(function (p) {
        return !p.isPlayerHost;
      });
      var totalPlayersCount = activePlayers.length || 1; // Fallback to 1 to avoid NaN divides

      // Count how many players have "hasSubmitted" flag set to true in the sync data
      var submittedCount = activePlayers.filter(function (p) {
        return p.hasSubmitted;
      }).length;
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_Prompt2ResponseSelectionScreen__WEBPACK_IMPORTED_MODULE_5__["default"], {
        isHost: isHost,
        promptText: currentPrompt,
        submittedCount: submittedCount,
        totalPlayers: totalPlayersCount,
        onSubmitResponse: handleSubmitResponse // Pass the submit handler!
        ,
        onRevealChoices: handleRevealChoices // Pass the reveal handler!
      });

    case 'judging':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((_Prompt2JudgingScreen_jsx__WEBPACK_IMPORTED_MODULE_6___default()), {
        roomCode: roomCode,
        isHost: isHost,
        submissions: submissions
      });
    case 'scoreboard':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((_Prompt2Scoreboard_jsx__WEBPACK_IMPORTED_MODULE_7___default()), {
        roomCode: roomCode,
        isHost: isHost,
        results: roundResults
      });
    default:
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
        className: "text-center mt-5 text-white"
      }, "Loading Game Phase (", gameState, ")...");
  }
}

/***/ }),

/***/ "./src/features/Prompt2/Prompt2JudgingScreen.jsx":
/*!*******************************************************!*\
  !*** ./src/features/Prompt2/Prompt2JudgingScreen.jsx ***!
  \*******************************************************/
/***/ (() => {



/***/ }),

/***/ "./src/features/Prompt2/Prompt2Lobby.jsx":
/*!***********************************************!*\
  !*** ./src/features/Prompt2/Prompt2Lobby.jsx ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Prompt2Lobby)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Container.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/ListGroup.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Badge.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");



function Prompt2Lobby(_ref) {
  var roomCode = _ref.roomCode,
    _ref$players = _ref.players,
    players = _ref$players === void 0 ? [] : _ref$players,
    isHost = _ref.isHost;
  var handleShowRules = function handleShowRules() {
    console.log("[Lobby] Clicked 'All in!' - Emitting showRules event for room:", roomCode);
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.emit('showRules', {
      roomCode: roomCode
    });
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    className: "mt-5 d-flex justify-content-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    className: "shadow-sm w-100",
    style: {
      maxWidth: '420px'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Body, {
    className: "text-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Title, {
    className: "fs-3 fw-bold mb-1 text-success"
  }, "Waiting Room"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "text-muted small mb-4"
  }, "Game: Judge Style Arena"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "bg-light p-3 rounded mb-4 border"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "text-secondary d-block small fw-bold text-uppercase"
  }, "Room Code"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "fs-2 fw-bold text-dark tracking-wide"
  }, roomCode)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h5", {
    className: "text-start mb-2 fw-semibold"
  }, "Players Joined:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    className: "mb-4 text-start"
  }, players.map(function (player) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"].Item, {
      key: player.id,
      className: "d-flex justify-content-between align-items-center"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, player.name), player.isPlayerHost && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
      bg: "primary",
      className: "rounded-pill"
    }, "Host / Judge"));
  })), isHost ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"], {
    variant: "primary",
    className: "w-100 fw-bold py-2",
    disabled: players.length < 2,
    onClick: handleShowRules
  }, players.length < 2 ? 'Waiting for Players (Min 3)' : 'All in!') : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-muted small py-2 border border-dashed rounded bg-light"
  }, "Waiting for the host to show rules..."))));
}

/***/ }),

/***/ "./src/features/Prompt2/Prompt2PromptSelectionScreen.jsx":
/*!***************************************************************!*\
  !*** ./src/features/Prompt2/Prompt2PromptSelectionScreen.jsx ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Prompt2PromptSelectionScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/**
 * Prompt2PromptSelectionScreen
 * * @param {boolean} isHost - Determines if the current player is the host.
 * @param {function} onSelectPrompt - Callback function triggered when the host selects a card.
 */
function Prompt2PromptSelectionScreen(_ref) {
  var isHost = _ref.isHost,
    onSelectPrompt = _ref.onSelectPrompt;
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState2 = _slicedToArray(_useState, 2),
    options = _useState2[0],
    setOptions = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isLoading = _useState4[0],
    setIsLoading = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState6 = _slicedToArray(_useState5, 2),
    error = _useState6[0],
    setError = _useState6[1];

  // 1. Fetch random prompts from the backend when the Host view mounts
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    if (isHost) {
      // 1. Check if we are running locally
      // const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // // 2. Point to localhost for local dev, or the working Render backend for production
      // const backendBase = isLocal 
      //   ? 'http://localhost:5000' // Change this to your Render URL if you aren't running a local backend
      //   : 'https://game-temple-backend.onrender.com';

      setIsLoading(true);

      // 3. Fetch using the dynamically resolved backend base
      fetch("https://game-temple-backend.onrender.com/api/prompt2host").then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to fetch cards: Status ".concat(res.status));
        }
        return res.json();
      }).then(function (response) {
        if (response.success && Array.isArray(response.data)) {
          setOptions(response.data);
        } else {
          throw new Error("Invalid API response structure");
        }
      })["catch"](function (err) {
        console.error("Error fetching prompts:", err);
        setError(err.message);
      })["finally"](function () {
        setIsLoading(false);
      });
    }
  }, [isHost]);
  // ----------------------------------------------------
  // PLAYER VIEW (Non-Host)
  // ----------------------------------------------------
  if (!isHost) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "text-center space-y-6 max-w-md"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "relative flex items-center justify-center w-20 h-20 mx-auto"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-25"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "relative inline-flex rounded-full h-12 w-12 bg-indigo-600 items-center justify-center"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "text-xl"
    }, "\uD83E\uDD14"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
      className: "text-3xl font-bold tracking-wide text-slate-100 animate-pulse"
    }, "Host is selecting prompt..."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "text-slate-400 text-sm"
    }, "Think ahead! Get ready to play your best response cards once the prompt is chosen.")));
  }

  // ----------------------------------------------------
  // HOST VIEW - LOADING STATE
  // ----------------------------------------------------
  if (isLoading) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "text-center space-y-4"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "text-slate-400 text-lg"
    }, "Gathering potential prompts...")));
  }

  // ----------------------------------------------------
  // HOST VIEW - ERROR STATE
  // ----------------------------------------------------
  if (error) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "text-center space-y-4 max-w-md"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "text-red-500 text-5xl"
    }, "\u26A0\uFE0F"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
      className: "text-xl font-bold text-slate-200"
    }, "Failed to load prompts"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "text-red-400 text-sm"
    }, error), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      onClick: function onClick() {
        return window.location.reload();
      },
      className: "mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition"
    }, "Try Again")));
  }

  // ----------------------------------------------------
  // HOST VIEW - SUCCESS STATE
  // ----------------------------------------------------
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "flex flex-col items-center justify-center min-h-screen bg-slate-900 text-black p-6"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "max-w-4xl w-full text-center space-y-8"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "text-xs font-bold uppercase tracking-widest bg-indigo-600/30 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20"
  }, "Host Turn"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h1", {
    className: "text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mt-3"
  }, "Pick the Perfect Prompt"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "text-slate-400 mt-2 text-base md:text-lg"
  }, "Choose one of the three random cards below to set the theme for this round.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
  }, options.map(function (card, index) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      key: card._id || index // MongoDB uses _id instead of id
      ,
      onClick: function onClick() {
        return onSelectPrompt(card);
      },
      className: "flex flex-col justify-between p-6 bg-slate-800 border-2 border-slate-700/60 rounded-2xl text-left transition-all duration-300 hover:border-indigo-500 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-98 group min-h-[220px]"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/60 px-2.5 py-1 rounded-md w-max border border-indigo-500/10"
    }, card.type || 'prompt'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "text-lg font-medium text-slate-200 mt-4 flex-grow group-hover:text-black leading-relaxed"
    }, card.text), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "mt-6 text-sm font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1"
    }, "Choose this prompt ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "\u2192")));
  }))));
}

/***/ }),

/***/ "./src/features/Prompt2/Prompt2ResponseSelectionScreen.jsx":
/*!*****************************************************************!*\
  !*** ./src/features/Prompt2/Prompt2ResponseSelectionScreen.jsx ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Prompt2ResponseSelectionScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


/**
 * Prompt2ResponseSelectionScreen Component
 * * @param {boolean} isHost - Whether the current client is the host.
 * @param {string} promptText - The prompt selected for this round.
 * @param {number} submittedCount - Number of players who have already submitted.
 * @param {number} totalPlayers - Total number of active players (excluding host).
 * @param {function} onSubmitResponse - Callback when player submits a response. Takes selected response string.
 * @param {function} onRevealChoices - Callback when host clicks 'Reveal Choices'.
 */
function Prompt2ResponseSelectionScreen(_ref) {
  var isHost = _ref.isHost,
    _ref$promptText = _ref.promptText,
    promptText = _ref$promptText === void 0 ? "Default Prompt: What is the meaning of life?" : _ref$promptText,
    _ref$submittedCount = _ref.submittedCount,
    submittedCount = _ref$submittedCount === void 0 ? 0 : _ref$submittedCount,
    _ref$totalPlayers = _ref.totalPlayers,
    totalPlayers = _ref$totalPlayers === void 0 ? 4 : _ref$totalPlayers,
    onSubmitResponse = _ref.onSubmitResponse,
    onRevealChoices = _ref.onRevealChoices;
  // Player-specific state
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState2 = _slicedToArray(_useState, 2),
    responses = _useState2[0],
    setResponses = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState4 = _slicedToArray(_useState3, 2),
    selectedIdx = _useState4[0],
    setSelectedIdx = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState6 = _slicedToArray(_useState5, 2),
    hasSubmitted = _useState6[0],
    setHasSubmitted = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(!isHost),
    _useState8 = _slicedToArray(_useState7, 2),
    loading = _useState8[0],
    setLoading = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState10 = _slicedToArray(_useState9, 2),
    error = _useState10[0],
    setError = _useState10[1];

  // Fetch 7 random responses for the player
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    if (isHost) return;
    var fetchResponses = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var response, data, fetchedList;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                setLoading(true);
                _context.next = 4;
                return fetch('/prompt2players');
              case 4:
                response = _context.sent;
                if (response.ok) {
                  _context.next = 7;
                  break;
                }
                throw new Error('Failed to fetch responses from server.');
              case 7:
                _context.next = 9;
                return response.json();
              case 9:
                data = _context.sent;
                // Expecting an array of strings or objects from the API. 
                // Adjust "data.responses" if your API returns a nested object.
                fetchedList = Array.isArray(data) ? data : data.responses || [];
                setResponses(fetchedList.slice(0, 7)); // Ensure we grab exactly 7
                _context.next = 17;
                break;
              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](0);
                setError(_context.t0.message);
              case 17:
                _context.prev = 17;
                setLoading(false);
                return _context.finish(17);
              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 14, 17, 20]]);
      }));
      return function fetchResponses() {
        return _ref2.apply(this, arguments);
      };
    }();
    fetchResponses();
  }, [isHost]);

  // Handle Player Submission
  var handleSubmit = function handleSubmit() {
    if (selectedIdx === null) return;
    var choice = responses[selectedIdx];
    setHasSubmitted(true);
    if (onSubmitResponse) {
      onSubmitResponse(choice);
    }
  };

  // --- HOST VIEW ---
  if (isHost) {
    var allPlayersSubmitted = submittedCount >= totalPlayers;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "max-w-2xl w-full text-center space-y-8 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "px-4 py-1.5 bg-indigo-600/30 text-indigo-400 rounded-full text-sm font-semibold tracking-wide uppercase"
    }, "Host Screen"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "text-slate-400 text-sm font-medium"
    }, "Active Prompt"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h1", {
      className: "text-2xl md:text-3xl font-extrabold text-amber-400 leading-snug"
    }, "\"", promptText, "\"")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("hr", {
      className: "border-slate-700"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "text-lg font-medium text-slate-300"
    }, "Submissions Received"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "text-4xl font-black text-white"
    }, submittedCount, " ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "text-slate-500"
    }, "/"), " ", totalPlayers), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "w-full bg-slate-700 rounded-full h-3 overflow-hidden"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "bg-emerald-500 h-full transition-all duration-500 ease-out",
      style: {
        width: "".concat(submittedCount / totalPlayers * 100, "%")
      }
    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "pt-6"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      onClick: onRevealChoices,
      disabled: !allPlayersSubmitted,
      className: "w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 ".concat(allPlayersSubmitted ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer animate-pulse' : 'bg-slate-700 text-slate-500 cursor-not-allowed')
    }, allPlayersSubmitted ? '💡 Reveal Choices!' : 'Waiting for Players...'))));
  }

  // --- PLAYER VIEW ---
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "flex flex-col items-center min-h-screen bg-slate-950 text-white p-4 md:p-8"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "max-w-3xl w-full space-y-6"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-lg"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "text-xs font-bold text-amber-400 tracking-wider uppercase block mb-2"
  }, "The Prompt"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "text-xl md:text-2xl font-bold leading-relaxed text-slate-100"
  }, promptText)), loading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-center py-12 space-y-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 mx-auto"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "text-slate-400"
  }, "Loading your answer choices...")), error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center"
  }, error), !loading && !error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, hasSubmitted ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center space-y-4"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-5xl"
  }, "\u2705"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "text-xl font-bold text-emerald-400"
  }, "Response Submitted!"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "text-slate-400 text-sm"
  }, "Sit tight. Waiting for the rest of the players to choose their answers.")) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "text-sm font-semibold text-slate-400 uppercase tracking-wider text-center"
  }, "Select your favorite response:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "grid grid-cols-1 gap-3"
  }, responses.map(function (resp, idx) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      key: idx,
      onClick: function onClick() {
        return setSelectedIdx(idx);
      },
      className: "w-full p-4 text-left rounded-xl border font-medium transition duration-150 transform hover:-translate-y-0.5 ".concat(selectedIdx === idx ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-500 shadow-indigo-500/25 shadow-md' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300')
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "inline-block w-6 text-slate-500 font-mono text-sm"
    }, idx + 1, "."), resp);
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "pt-4 flex justify-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    onClick: handleSubmit,
    disabled: selectedIdx === null,
    className: "w-full md:w-64 py-4 rounded-xl font-bold text-lg shadow-lg transition duration-200 transform active:scale-95 ".concat(selectedIdx !== null ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer' : 'bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed')
  }, "Submit Answer"))))));
}

/***/ }),

/***/ "./src/features/Prompt2/Prompt2RulesScreen.jsx":
/*!*****************************************************!*\
  !*** ./src/features/Prompt2/Prompt2RulesScreen.jsx ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Prompt2RulesScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Container.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");



function Prompt2RulesScreen(_ref) {
  var roomCode = _ref.roomCode,
    isHost = _ref.isHost;
  var handleNext = function handleNext() {
    console.log("Sending startPromptSelection event for room: ".concat(roomCode));
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.prompt2Socket.emit('startPromptSelection', {
      roomCode: roomCode
    });
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    className: "mt-5 d-flex justify-content-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    className: "shadow-sm w-100",
    style: {
      maxWidth: "420px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Body, {
    className: "text-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Title, {
    className: "fw-bold mb-3 fs-4 text-primary"
  }, "How to Play"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-start fs-6 mb-4 p-3 bg-light rounded border"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ol", {
    className: "ps-3 mb-0 text-secondary",
    style: {
      gap: '14px',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Host Picks the Prompt:"), " One player is chosen as the Host each round. They get to pick ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "1 out of 3 random prompts"), " to set the vibe."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Players Respond:"), " The other players look at their hand of ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "7 options"), " (6 pre-drawn cards + 1 custom \"Write-In\") and submit their funniest answer."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Host Judges the Winner:"), " The Host reads all the submissions anonymously and crowns the winner of the round!"))), isHost ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    variant: "primary",
    className: "w-100 fw-bold py-2 shadow-sm",
    onClick: handleNext
  }, "Begin Round 1") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-muted small py-2 border border-dashed rounded bg-light"
  }, "Waiting for the host to start the game..."))));
}

/***/ }),

/***/ "./src/features/Prompt2/Prompt2Scoreboard.jsx":
/*!****************************************************!*\
  !*** ./src/features/Prompt2/Prompt2Scoreboard.jsx ***!
  \****************************************************/
/***/ (() => {



/***/ }),

/***/ "./src/features/TicTacToe/TicTacToe.jsx":
/*!**********************************************!*\
  !*** ./src/features/TicTacToe/TicTacToe.jsx ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TictactoeRoom),
/* harmony export */   "tictactoeSocket": () => (/* binding */ tictactoeSocket)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Spinner.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Row.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Col.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Badge.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Modal.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! socket.io-client */ "./node_modules/socket.io-client/build/esm/index.js");
/* harmony import */ var _assets_logos_HourGlassBlue_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../assets/logos/HourGlassBlue.png */ "./src/assets/logos/HourGlassBlue.png");
/* harmony import */ var _assets_logos_Tic_Tac_Toe_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../assets/logos/Tic-Tac-Toe.png */ "./src/assets/logos/Tic-Tac-Toe.png");
/* harmony import */ var _assets_logos_X_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../assets/logos/X.png */ "./src/assets/logos/X.png");
/* harmony import */ var _assets_logos_O_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../assets/logos/O.png */ "./src/assets/logos/O.png");
/* harmony import */ var _assets_logos_HourGlass_gif__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../assets/logos/HourGlass.gif */ "./src/assets/logos/HourGlass.gif");
/* harmony import */ var _assets_logos_fireworks5_gif__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../assets/logos/fireworks5.gif */ "./src/assets/logos/fireworks5.gif");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }










var BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/tictactoe' : 'https://game-temple-backend.onrender.com/tictactoe';
var tictactoeSocket = (0,socket_io_client__WEBPACK_IMPORTED_MODULE_1__.io)(BACKEND_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling']
});
function TictactoeRoom() {
  var _useSearchParams = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_8__.useSearchParams)(),
    _useSearchParams2 = _slicedToArray(_useSearchParams, 1),
    searchParams = _useSearchParams2[0];
  var roomCode = searchParams.get('room') || 'UNKNOWN';
  var playerRole = searchParams.get('role') || 'guest';
  var playerName = searchParams.get('name') || 'Anonymous';
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('loading'),
    _useState2 = _slicedToArray(_useState, 2),
    roomStatus = _useState2[0],
    setRoomStatus = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(Array(9).fill('')),
    _useState4 = _slicedToArray(_useState3, 2),
    board = _useState4[0],
    setBoard = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true),
    _useState6 = _slicedToArray(_useState5, 2),
    isNext = _useState6[0],
    setIsNext = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(''),
    _useState8 = _slicedToArray(_useState7, 2),
    opponentName = _useState8[0],
    setOpponentName = _useState8[1];
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    // Helper function to emit the join payload
    var emitJoinRoom = function emitJoinRoom() {
      console.log("Emitting joinRoom payload...", {
        roomCode: roomCode,
        playerRole: playerRole,
        playerName: playerName
      });
      tictactoeSocket.emit('joinRoom', {
        roomCode: roomCode,
        playerRole: playerRole,
        playerName: playerName
      });
    };
    var onConnect = function onConnect() {
      console.log("Socket connected event fired, joining room...");
      emitJoinRoom();
    };
    tictactoeSocket.on('connect', onConnect);
    tictactoeSocket.on('roomUpdate', function (roomData) {
      if (roomData) {
        setBoard(roomData.board);
        setIsNext(roomData.isNext);
        setRoomStatus(roomData.status);
        setOpponentName(playerRole === 'host' ? roomData.guestName : roomData.hostName);
      }
    });
    tictactoeSocket.on('roomNotFound', function () {
      return setRoomStatus('not-found');
    });

    // --- CRITICAL CONNECTION TIMING FIX ---
    // If the socket connection is already active from our button handler file, join immediately!
    if (tictactoeSocket.connected) {
      console.log("Socket is already open, skipping connect event block.");
      emitJoinRoom();
    } else {
      tictactoeSocket.connect();
    }
    return function () {
      tictactoeSocket.off('connect', onConnect);
      tictactoeSocket.off('roomUpdate');
      tictactoeSocket.off('roomNotFound');
    };
  }, [roomCode, playerRole, playerName]);
  var calculateWinner = function calculateWinner(squares) {
    var lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (var _i2 = 0, _lines = lines; _i2 < _lines.length; _i2++) {
      var _lines$_i = _slicedToArray(_lines[_i2], 3),
        a = _lines$_i[0],
        b = _lines$_i[1],
        c = _lines$_i[2];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return squares.every(function (s) {
      return s !== '';
    }) ? 'Draw' : null;
  };
  var winner = calculateWinner(board);
  var isMyTurn = playerRole === 'host' && isNext || playerRole === 'guest' && !isNext;

  //--------------------------
  // Winner Text For Modal
  //--------------------------
  var getWinnerText = function getWinnerText() {
    if (!winner) return '';
    if (winner === 'Draw') return "It's a Tie!";
    var winningRole = winner === 'X' ? 'host' : 'guest';
    if (playerRole === winningRole) {
      return "Victory! You Win!";
    } else {
      return "".concat(opponentName || 'Opponent', " Wins!");
    }
  };
  var handleSquareClick = function handleSquareClick(index) {
    if (board[index] || winner) return;
    if (!isMyTurn) return;
    var newBoard = _toConsumableArray(board);
    newBoard[index] = playerRole === 'host' ? 'X' : 'O';
    tictactoeSocket.emit('makeMove', {
      roomCode: roomCode,
      board: newBoard,
      isNext: !isNext
    });
  };
  var handleReset = function handleReset() {
    return tictactoeSocket.emit('resetMatch', {
      roomCode: roomCode
    });
  };
  var handleLeaveRoom = function handleLeaveRoom() {
    return window.location.href = '/home';
  };
  if (roomStatus === 'loading') return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1",
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_9__["default"], {
    animation: "border",
    variant: "primary"
  }));

  //-----------------
  // Waiting Room
  //-----------------
  if (roomStatus === 'waiting') return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1",
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
    className: "text-center shadow-lg border-0",
    style: {
      maxWidth: "450px",
      width: "100%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"].Header, {
    as: "h5",
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    }
  }, "Tic-Tac-Toe Room Created"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"].Body, {
    className: "p-4"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
    src: _assets_logos_HourGlass_gif__WEBPACK_IMPORTED_MODULE_6__,
    alt: "Waiting Hourglass",
    className: "img-fluid",
    style: {
      maxWidth: "140px",
      height: "auto"
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h1", {
    className: "display-4 fw-bold text-primary mb-2"
  }, roomCode), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "text-muted fw-bold small text-uppercase tracking-wider mb-0"
  }, "Waiting for opponent..."))));

  // Game Play code
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1",
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
    className: "text-center shadow-lg border-0",
    style: {
      maxWidth: "450px",
      width: "100%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"].Header, {
    as: "h5",
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    }
  }, "Tic-Tac-Toe"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"].Body, {
    className: "p-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"], {
    className: "mb-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"], {
    xs: 4
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_13__["default"], {
    bg: playerRole === 'host' ? "primary" : "secondary",
    className: "p-2 w-100 text-truncate"
  }, playerRole === 'guest' ? playerName : opponentName)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"], {
    xs: 4,
    className: "text-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h6", {
    className: "m-0 fw-bold small text-uppercase ".concat(isMyTurn ? 'text-primary' : 'text-muted')
  }, isMyTurn ? "Your Turn" : "".concat(opponentName, "'s Turn"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"], {
    xs: 4
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_13__["default"], {
    bg: playerRole === 'host' ? "secondary" : "primary",
    className: "p-2 w-100 text-truncate"
  }, playerRole === 'guest' ? opponentName : playerName))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "mx-auto",
    style: {
      maxWidth: '300px'
    }
  }, [0, 3, 6].map(function (row) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"], {
      key: row,
      className: "g-2 mb-2"
    }, [0, 1, 2].map(function (col) {
      var squareValue = board[row + col];
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"], {
        xs: 4,
        key: row + col
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_14__["default"], {
        variant: squareValue ? "light" : "outline-secondary",
        className: "w-100 d-flex align-items-center justify-content-center p-0 overflow-hidden",
        style: {
          height: '90px'
        },
        onClick: function onClick() {
          return handleSquareClick(row + col);
        }
      }, squareValue === 'X' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
        src: _assets_logos_X_png__WEBPACK_IMPORTED_MODULE_4__,
        alt: "X",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }
      }), squareValue === 'O' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
        src: _assets_logos_O_png__WEBPACK_IMPORTED_MODULE_5__,
        alt: "O",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }
      })));
    }));
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_14__["default"], {
    variant: "outline-primary",
    className: "w-100 mt-3",
    onClick: handleReset
  }, "Reset Arena"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_15__["default"], {
    show: !!winner,
    onHide: function onHide() {},
    backdrop: "static",
    keyboard: false,
    centered: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_15__["default"].Header, {
    as: "h5",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    },
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-black tracking-widest text-uppercase fs-6"
  }, "GAME OVER"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_15__["default"].Body, {
    className: "text-center p-4"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", {
    src: _assets_logos_fireworks5_gif__WEBPACK_IMPORTED_MODULE_7__,
    alt: "Winning!!!",
    className: "img-fluid",
    style: {
      maxWidth: "140px",
      height: "auto"
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "fw-bold text-dark mb-4"
  }, getWinnerText()), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex gap-2"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_14__["default"], {
    variant: "outline-primary",
    className: "w-100 fw-bold py-2",
    onClick: handleReset
  }, "Play Again"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_14__["default"], {
    variant: "primary",
    className: "w-100 fw-bold py-2",
    onClick: handleLeaveRoom
  }, "Leave Room")))));
}

/***/ }),

/***/ "./src/features/TicTacToe/TicTacToeCreateButton.jsx":
/*!**********************************************************!*\
  !*** ./src/features/TicTacToe/TicTacToeCreateButton.jsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "handleCreateTttRoom": () => (/* binding */ handleCreateTttRoom)
/* harmony export */ });
/* harmony import */ var _TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TicTacToe.jsx */ "./src/features/TicTacToe/TicTacToe.jsx");
 // Adjust path to your TicTacToe component

function handleCreateTttRoom(playerName, navigate, setIsCreatingRoom) {
  var cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';

  // Turn on Loading Modal
  if (setIsCreatingRoom) setIsCreatingRoom(true);
  console.log("Requesting Tic-Tac-Toe Room creation for: ".concat(cleanName));

  // Ensure the namespace socket is connected
  if (!_TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__.tictactoeSocket.connected) {
    _TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__.tictactoeSocket.connect();
  }

  // Clean up stale creation listeners
  _TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__.tictactoeSocket.off('roomCreated');
  _TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__.tictactoeSocket.off('connect_error');

  // If socket connect fails, turn off Modal
  _TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__.tictactoeSocket.once('connect_error', function (err) {
    console.error("Socket connection error: ", err);
    if (setIsCreatingRoom) setIsCreatingRoom(false);
    alert("Could not connect to the game server.");
  });

  // Fire the creation event to the backend
  _TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__.tictactoeSocket.emit('createRoom', {
    hostName: cleanName
  });

  // Listen for the backend to hand back the generated 'T***' room code
  _TicTacToe_jsx__WEBPACK_IMPORTED_MODULE_0__.tictactoeSocket.once('roomCreated', function (_ref) {
    var roomCode = _ref.roomCode;
    console.log("Tic-Tac-Toe room created! Code: ".concat(roomCode));
    // Redirect the host directly to the board with the server-generated code
    navigate("/tictactoe?room=".concat(roomCode, "&role=host&name=").concat(encodeURIComponent(cleanName)));
  });
}

/***/ }),

/***/ "./src/features/Trivia/QuestionScreen.jsx":
/*!************************************************!*\
  !*** ./src/features/Trivia/QuestionScreen.jsx ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ QuestionScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }



function QuestionScreen(_ref) {
  var roomCode = _ref.roomCode,
    currentQuestion = _ref.currentQuestion,
    playerAnswers = _ref.playerAnswers;
  var hasAnswered = !!(playerAnswers !== null && playerAnswers !== void 0 && playerAnswers[_socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.id]);
  var choices = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(function () {
    if (!currentQuestion) return [];
    var incorrects = Array.isArray(currentQuestion.incorrect_answers) ? currentQuestion.incorrect_answers.flat() : [];
    var combined = [].concat(_toConsumableArray(incorrects), [currentQuestion.correct_answer]);
    return combined.sort(function (a, b) {
      return a.localeCompare(b);
    });
  }, [currentQuestion]);
  var handleChoiceClick = function handleChoiceClick(selectedChoice) {
    if (hasAnswered) return;
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.emit('submitAnswer', {
      roomCode: roomCode,
      answer: selectedChoice
    });
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1",
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    className: "text-center shadow-lg border-0 w-100",
    style: {
      maxWidth: "450px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Header, {
    as: "h5",
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    }
  }, "TRIVIA-TEMPLE"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Body, {
    className: "p-3"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "w-100 text-center p-2"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Title, {
    className: "fs-4 fw-bold mb-4 text-dark text-break"
  }, currentQuestion === null || currentQuestion === void 0 ? void 0 : currentQuestion.question), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-grid gap-2"
  }, choices.map(function (choice, index) {
    var isMyChoice = (playerAnswers === null || playerAnswers === void 0 ? void 0 : playerAnswers[_socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.id]) === choice;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
      key: index,
      variant: isMyChoice ? "primary" : "outline-secondary",
      disabled: hasAnswered,
      onClick: function onClick() {
        return handleChoiceClick(choice);
      }
      // 3. Added 'text-break' to the buttons to handle long answers gracefully
      ,
      className: "py-2 fw-semibold text-start px-3 shadow-sm text-break"
    }, choice);
  })), hasAnswered &&
  /*#__PURE__*/
  // 4. Added 'text-break' to the locked message banner
  react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-muted small py-2 border border-dashed rounded bg-light mt-4 animate-pulse text-break"
  }, "\u23F3 Answer locked! Waiting for remaining players...")))));
}

/***/ }),

/***/ "./src/features/Trivia/RulesScreen.jsx":
/*!*********************************************!*\
  !*** ./src/features/Trivia/RulesScreen.jsx ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RulesScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");



function RulesScreen(_ref) {
  var roomCode = _ref.roomCode,
    isHost = _ref.isHost;
  var handleNext = function handleNext() {
    console.log("Sending nextRound event for room:".concat(roomCode));
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.emit('nextRound', {
      roomCode: roomCode
    });
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1",
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    className: "text-center shadow-lg border-0",
    style: {
      maxWidth: "450px",
      width: "100%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Header, {
    as: "h5",
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    }
  }, "TRIVIA-TEMPLE"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Body, {
    className: "text-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Title, {
    className: "fs-3 fw-bold mb-3 text-primary"
  }, "Game Rules"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Text, {
    className: "text-start fs-6 mb-4 p-3 bg-light rounded border"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "How to play Temple-Trivia:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "1. The game consists of ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "3 rounds"), ".", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "2. Read the question carefully.", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "3. You earn ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "1 point"), " per correct answer.", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "4. The scoreboard shifts instantly once everyone logs their vote!"), isHost ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    variant: "primary",
    className: "w-100 fw-bold py-2 shadow-sm",
    onClick: handleNext
  }, "Begin Round 1") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-muted small py-2 border border-dashed rounded bg-light"
  }, "Waiting for the host to launch the first question..."))));
}

/***/ }),

/***/ "./src/features/Trivia/ScoreboardScreen.jsx":
/*!**************************************************!*\
  !*** ./src/features/Trivia/ScoreboardScreen.jsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ScoreboardScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/ListGroup.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Badge.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }



function ScoreboardScreen(_ref) {
  var roomCode = _ref.roomCode,
    players = _ref.players,
    isHost = _ref.isHost;
  var handleNextRound = function handleNextRound() {
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.emit('advanceFromScoreboard', {
      roomCode: roomCode
    });
  };

  // Keep highest ranking profile at array position index 0
  var sortedPlayers = _toConsumableArray(players).sort(function (a, b) {
    return (b.score || 0) - (a.score || 0);
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1",
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    className: "text-center shadow-lg border-0 w-100",
    style: {
      maxWidth: "450px"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Header, {
    as: "h5",
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    }
  }, "TRIVIA-TEMPLE"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Body, {
    className: "text-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"].Title, {
    className: "fs-3 fw-bold mb-3 text-primary"
  }, "Scores"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    className: "mb-4 text-start border border-secondary rounded shadow-inner"
  }, sortedPlayers.map(function (player, index) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Item, {
      key: player.id,
      className: "d-flex justify-content-between align-items-center py-2.5 fw-semibold"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "d-flex align-items-center"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "text-muted me-2 small"
    }, "#", index + 1), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, player.name), player.id === _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.id && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
      bg: "info",
      className: "ms-2 text-white font-normal"
    }, "You")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
      bg: "success",
      className: "fs-6 py-1.5 px-2.5 rounded-pill"
    }, player.score || 0, " pts"));
  })), isHost ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
    variant: "primary",
    className: "w-100 fw-bold py-2 shadow-sm",
    onClick: handleNextRound
  }, "Advance Stage") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-muted small py-2 border border-dashed rounded bg-light"
  }, "\u23F3 Waiting for host to load the next round..."))));
}

/***/ }),

/***/ "./src/features/Trivia/TriviaCreateButton.jsx":
/*!****************************************************!*\
  !*** ./src/features/Trivia/TriviaCreateButton.jsx ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "handleCreateTriviaRoom": () => (/* binding */ handleCreateTriviaRoom)
/* harmony export */ });
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");

function handleCreateTriviaRoom(playerName, navigate, setIsCreatingRoom) {
  var cleanName = playerName && playerName.trim() ? playerName.trim() : 'Host';
  if (setIsCreatingRoom) setIsCreatingRoom(true);
  console.log("Requesting Trivia Room creation for: ".concat(cleanName));

  // Ensure the shared socket instance is open
  if (!_socket_js__WEBPACK_IMPORTED_MODULE_0__.triviaSocket.connected) {
    console.warn("Trivia socket is disconnected! Connecting...");
    _socket_js__WEBPACK_IMPORTED_MODULE_0__.triviaSocket.connect();
  }

  // Clean up any stale listeners on the shared socket
  _socket_js__WEBPACK_IMPORTED_MODULE_0__.triviaSocket.off('roomCreated');
  _socket_js__WEBPACK_IMPORTED_MODULE_0__.triviaSocket.off('connect_error');

  // Close Modal if connection fails
  _socket_js__WEBPACK_IMPORTED_MODULE_0__.triviaSocket.once('connect_error', function (err) {
    console.error("Trivia Socket connection error:", err);
    if (setIsCreatingRoom) setIsCreatingRoom(false);
    alert("Could not connect to the Trivia server.");
  });

  // Fire the creation event
  _socket_js__WEBPACK_IMPORTED_MODULE_0__.triviaSocket.emit('createRoom', {
    hostName: cleanName
  });

  // Listen once for the backend room blueprint assignment
  _socket_js__WEBPACK_IMPORTED_MODULE_0__.triviaSocket.once('roomCreated', function (_ref) {
    var roomCode = _ref.roomCode;
    console.log("Trivia room created successfully! Code: ".concat(roomCode));
    navigate("/TriviaWaitingRoom?room=".concat(roomCode, "&role=host&name=").concat(encodeURIComponent(cleanName)));
  });
}

/***/ }),

/***/ "./src/features/Trivia/TriviaGameOver.jsx":
/*!************************************************!*\
  !*** ./src/features/Trivia/TriviaGameOver.jsx ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GameOverScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Container.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/ListGroup.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Badge.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }



function GameOverScreen(_ref) {
  var players = _ref.players,
    roomCode = _ref.roomCode,
    isHost = _ref.isHost;
  // Sort players to find the ultimate winner
  var standings = _toConsumableArray(players).sort(function (a, b) {
    return (b.score || 0) - (a.score || 0);
  });
  var winner = standings[0];
  var handleRestart = function handleRestart() {
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.emit('nextRound', {
      roomCode: roomCode
    });
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"], {
    className: "mt-5 d-flex justify-content-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"], {
    className: "shadow-lg w-100 text-center border-0",
    style: {
      maxWidth: '440px',
      background: '#f8f9fa'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Body, {
    className: "py-5 px-4"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "fs-1 mb-2"
  }, "\uD83C\uDFC6"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Title, {
    className: "fs-2 fw-bold text-dark mb-1"
  }, "Game Over!"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"].Text, {
    className: "text-muted mb-4"
  }, "Final Standings"), winner && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "p-3 mb-4 rounded-3 border bg-white shadow-sm",
    style: {
      borderColor: '#ffd700'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "text-muted small d-block uppercase fw-bold tracking-wider text-warning"
  }, "Grand Champion"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "fs-3 fw-black text-dark"
  }, winner.name), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "d-block text-success fw-bold fs-5 mt-1"
  }, winner.score || 0, " Points")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"], {
    className: "mb-4 text-start shadow-sm rounded border"
  }, standings.slice(1).map(function (player, index) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_4__["default"].Item, {
      key: player.id,
      className: "d-flex justify-content-between align-items-center py-2 bg-white"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "text-muted me-2 small"
    }, "#", index + 2), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "fw-semibold text-secondary"
    }, player.name)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_5__["default"], {
      bg: "secondary",
      className: "rounded-pill"
    }, player.score || 0, " pts"));
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-grid gap-2 mt-4"
  }, isHost ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"], {
    variant: "primary",
    className: "w-100 fw-bold py-2 shadow-sm",
    onClick: handleRestart
  }, "Play Again") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-muted small py-2.5 border border-dashed rounded bg-white text-center"
  }, "\u23F3 Waiting for the host to start a new match..."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_6__["default"], {
    variant: "outline-primary",
    className: "w-100 fw-bold py-2 shadow-sm",
    onClick: function onClick() {
      return window.location.href = '/home';
    }
  }, "Home")))));
}

/***/ }),

/***/ "./src/features/Trivia/TriviaWaitingRoom.jsx":
/*!***************************************************!*\
  !*** ./src/features/Trivia/TriviaWaitingRoom.jsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TriviaWaitingRoom)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router/dist/development/chunk-QUQL4437.mjs");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Container.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Alert.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Button.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Card.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/Badge.js");
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/ListGroup.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../socket.js */ "./src/socket.js");
/* harmony import */ var _RulesScreen_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./RulesScreen.jsx */ "./src/features/Trivia/RulesScreen.jsx");
/* harmony import */ var _QuestionScreen_jsx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QuestionScreen.jsx */ "./src/features/Trivia/QuestionScreen.jsx");
/* harmony import */ var _ScoreboardScreen_jsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ScoreboardScreen.jsx */ "./src/features/Trivia/ScoreboardScreen.jsx");
/* harmony import */ var _TriviaGameOver_jsx__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./TriviaGameOver.jsx */ "./src/features/Trivia/TriviaGameOver.jsx");
/* harmony import */ var _assets_logos_HourGlass_gif__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../assets/logos/HourGlass.gif */ "./src/assets/logos/HourGlass.gif");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }









function TriviaWaitingRoom() {
  var _useSearchParams = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_7__.useSearchParams)(),
    _useSearchParams2 = _slicedToArray(_useSearchParams, 1),
    searchParams = _useSearchParams2[0];
  var navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_7__.useNavigate)();

  // Grab configuration from the URL params sent by UniversalJoinForm
  var roomCode = searchParams.get('room');
  var urlName = searchParams.get('name') || 'Anonymous';
  var role = searchParams.get('role') || 'guest'; // 'host' or 'guest'

  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState2 = _slicedToArray(_useState, 2),
    players = _useState2[0],
    setPlayers = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(''),
    _useState4 = _slicedToArray(_useState3, 2),
    error = _useState4[0],
    setError = _useState4[1];
  // Tracks roomState from Render Server
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState6 = _slicedToArray(_useState5, 2),
    roomState = _useState6[0],
    setRoomState = _useState6[1];
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    if (!roomCode) {
      setError('No room code provided!');
      return;
    }

    // Ensure socket connects to namespace
    if (!_socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.connected) {
      console.log("Waiting room socket disconnected. Estabilishing fresh handshake...");
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.connect();
    }
    // Removes pre-existing listener bindings - looks like double code, but isn't, so keep it
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.off('roomUpdated');
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.off('roomStateUpdated');
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.off('errorMsg');

    // Tell the server we want to join this room            
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.emit('joinRoom', {
      roomCode: roomCode,
      playerName: urlName
    });

    // Listen for real-time room synchronization updates
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.on('roomUpdated', function (data) {
      console.log("Lobby updated from trivia server:", data);
      setPlayers(data.players);
    });

    // Listen for gameplay phase transitions from Render backend
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.on('roomStateUpdated', function (updateRoom) {
      console.log("Gameplay state update:", updateRoom);
      setRoomState(updateRoom);
    });

    // Listen for any access errors (e.g., room doesn't exist)
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.on('errorMsg', function (msg) {
      setError(msg);
    });

    // Cleanup connections when the user leaves the page or closes the tab
    return function () {
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.off('roomUpdated');
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.off('roomStateUpdated');
      _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.off('errorMsg');
    };
  }, [roomCode, urlName]);

  // Emits activation trigger to backend to pull Questions
  var handleStartGame = function handleStartGame() {
    console.log("Starting trivia match for room: ", roomCode);
    _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.emit('startGame', {
      roomCode: roomCode
    });
  };
  if (error) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__["default"], {
      className: "mt-5 text-center",
      style: {
        maxWidth: '400px'
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_9__["default"], {
      variant: "danger"
    }, error), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
      variant: "primary",
      onClick: function onClick() {
        return navigate('/');
      }
    }, "Back to Home"));
  }

  // =========================================================================
  // DYNAMIC PHASE CONTROLLER EVALUATION
  // =========================================================================
  if (roomState) {
    switch (roomState.phase) {
      case 'RULES':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_RulesScreen_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], {
          roomCode: roomCode,
          isHost: role === 'host'
        });
      case 'QUESTION':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_QuestionScreen_jsx__WEBPACK_IMPORTED_MODULE_3__["default"], {
          roomCode: roomCode,
          currentQuestion: roomState.questions[roomState.currentRound],
          playerAnswers: roomState.playerAnswers
        });
      case 'SCOREBOARD':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_ScoreboardScreen_jsx__WEBPACK_IMPORTED_MODULE_4__["default"], {
          roomCode: roomCode,
          players: roomState.players,
          isHost: role === 'host'
        });
      case 'GAMEOVER':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TriviaGameOver_jsx__WEBPACK_IMPORTED_MODULE_5__["default"], {
          players: roomState.players,
          roomCode: roomCode,
          isHost: role === 'host'
        });
    }
  }

  // =========================================================================
  // DEFAULT LOBBY VIEW (If no phase has been launched yet)
  // =========================================================================
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "d-flex justify-content-center align-items-center p-1",
    style: {
      minHeight: "80vh"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"], {
    className: "text-center shadow-lg border-0",
    style: {
      maxWidth: "450px",
      width: "100%"
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"].Header, {
    as: "h5",
    className: "d-flex align-items-center justify-content-center border-0 py-2 fw-bold text-uppercase fs-6",
    style: {
      backgroundColor: '#014eb6',
      color: '#f1f2f5',
      letterSpacing: '0.2em'
    }
  }, "TRIVIA ROOM CREATED"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"].Body, {
    className: "text-center"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_11__["default"].Title, {
    className: "fs-3 fw-bold mb-4 text-primary"
  }, "Trivia Waiting Room"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "bg-light border border-secondary rounded p-3 mb-4"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "text-uppercase tracking-wider small fw-bold text-muted d-block mb-1"
  }, "Room Code"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "fs-2 fw-black text-dark tracking-widest"
  }, roomCode)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h5", {
    className: "text-start fw-bold mb-2 px-1"
  }, "Players Joined", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"], {
    bg: "secondary",
    className: "ms-2"
  }, players.length)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_13__["default"], {
    className: "mb-4 text-start border border-secondary rounded"
  }, players.map(function (player) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_13__["default"].Item, {
      key: player.id,
      className: "d-flex justify-content-between align-items-center py-2.5 fw-semibold"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, player.name), player.id === _socket_js__WEBPACK_IMPORTED_MODULE_1__.triviaSocket.id ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_12__["default"], {
      bg: "primary"
    }, "You") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "text-muted small"
    }, "Ready"));
  })), role === 'host' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_10__["default"], {
    variant: "primary",
    className: "w-100 fw-bold py-2 shadow-sm",
    onClick: handleStartGame // FIX: Connected the click listener
  }, "Start Game") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "text-muted small py-2 border border-dashed rounded bg-light"
  }, "Waiting for host to launch the match..."))));
}

/***/ }),

/***/ "./src/assets/logos/HourGlass.gif":
/*!****************************************!*\
  !*** ./src/assets/logos/HourGlass.gif ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "7e6af87e7c42ff614657.gif";

/***/ }),

/***/ "./src/assets/logos/HourGlassBlue.png":
/*!********************************************!*\
  !*** ./src/assets/logos/HourGlassBlue.png ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "52e1a2fc0ccdd3e2ee00.png";

/***/ }),

/***/ "./src/assets/logos/MartiniLogo.jpg":
/*!******************************************!*\
  !*** ./src/assets/logos/MartiniLogo.jpg ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "7f66e46716ec6b0af16f.jpg";

/***/ }),

/***/ "./src/assets/logos/O.png":
/*!********************************!*\
  !*** ./src/assets/logos/O.png ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "dad1b0ee3a5c252adfc7.png";

/***/ }),

/***/ "./src/assets/logos/Tic-Tac-Toe.png":
/*!******************************************!*\
  !*** ./src/assets/logos/Tic-Tac-Toe.png ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "c33163bef38b2a6ae0d9.png";

/***/ }),

/***/ "./src/assets/logos/X.png":
/*!********************************!*\
  !*** ./src/assets/logos/X.png ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "6ec00e8e5e59c3bf9f5d.png";

/***/ }),

/***/ "./src/assets/logos/background.jpg":
/*!*****************************************!*\
  !*** ./src/assets/logos/background.jpg ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "04cb48e407c1ac01c31f.jpg";

/***/ }),

/***/ "./src/assets/logos/fireworks5.gif":
/*!*****************************************!*\
  !*** ./src/assets/logos/fireworks5.gif ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "23cf9ee11e00eddfeeaa.gif";

/***/ }),

/***/ "./src/assets/logos/temple.jpg":
/*!*************************************!*\
  !*** ./src/assets/logos/temple.jpg ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "d989b26bd9bf9b335ac8.jpg";

/***/ }),

/***/ "./src/funnyNames.js":
/*!***************************!*\
  !*** ./src/funnyNames.js ***!
  \***************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "funnyNames": () => (/* binding */ funnyNames),
/* harmony export */   "getRandomFunnyName": () => (/* binding */ getRandomFunnyName)
/* harmony export */ });
var funnyNames = ["Anita Break", "Gladys Overwith", "Justin Case", "Paige Turner", "Robin Banks", "Barry Cade", "Ella Vator", "Tim Burr", "Al B. Back", "Luke Warm", "Ben There", "Chris P. Bacon", "Artie Choke", "Barb Dwyer", "Carrie Oakey", "Anita Job", "Neil Down", "Otto Mattic", "Phil M. Up", "Sue Shei",
// Food & Drink
"Al Dente", "Brie Cheese", "Mac Aroni", "Olive Tree", "Tom Morrow", "Sal Monella", "Pea Soup", "Heinz Sight", "C. Senor", "Sherry Wine",
// Actions & Phrasing
"Amanda Hugginkiss", "Anita Room", "Dan D. Lyon", "Earl E. Bird", "Eileen Dover", "Gilda Wreck", "Helen Highwater", "Hy Price", "Ilene Left", "Ivana Tinkle", "May B. Tomorrow", "Morey Bund", "Owen Money", "Ray O’Sunshyne", "Sharon Schmidt", "Theresa Green", "Walter Wall", "Warren Peace", "Will Power", "Xavier Breath",
// Occupations & Hobbies
"Ali Gator", "Anna Tomy", "Bill Ding", "Dusty Miller", "Ginger Vitis", "Harry Beard", "Jay Walker", "Lou Stool", "Marsha Mellow", "Penny Less", "Polly Graph", "Ray Gunn", "Rocky Shore", "Sandy Beaches", "Woody Forrester",
// Medical & Science
"Barry D. Hatchett", "Candy Barr", "Frank Enstein", "Gene Poole", "Gerry Atric", "Holly Wood", "Jack Pott", "Lily Pad", "Luke Sky-Walker", "Marcus Absent",
// Mischief & Crime
"Buster Move", "Chuck Wagon", "Crystal Ball", "Daisy Chain", "Don Key", "Ella Phant", "G. I. Joe"];
function getRandomFunnyName() {
  var randomIndex = Math.floor(Math.random() * funnyNames.length);
  return funnyNames[randomIndex];
}

/***/ }),

/***/ "./src/socket.js":
/*!***********************!*\
  !*** ./src/socket.js ***!
  \***********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "prompt2Socket": () => (/* binding */ prompt2Socket),
/* harmony export */   "triviaSocket": () => (/* binding */ triviaSocket)
/* harmony export */ });
/* harmony import */ var socket_io_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! socket.io-client */ "./node_modules/socket.io-client/build/esm/index.js");

var SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://game-temple-backend.onrender.com';

// Render handles both polling and websockets
var socket = (0,socket_io_client__WEBPACK_IMPORTED_MODULE_0__.io)(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: false
});
var triviaSocket = (0,socket_io_client__WEBPACK_IMPORTED_MODULE_0__.io)("".concat(SOCKET_URL, "/trivia"), {
  transports: ['websocket', 'polling'],
  autoConnect: false
});
var prompt2Socket = (0,socket_io_client__WEBPACK_IMPORTED_MODULE_0__.io)("".concat(SOCKET_URL, "/prompt2"), {
  transports: ['websocket', 'polling'],
  autoConnect: false
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (socket);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"employees": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkmodule01"] = self["webpackChunkmodule01"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/employees.jsx")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=employees.bundle.js.map
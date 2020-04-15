/**
       ____  ____   ____________________
   __ / / / / / /  /  _/ __/_  __/_  __/
  / // / /_/ / /___/ // _/  / /   / /   
  \___/\____/____/___/___/ /_/   /_/    
                                                                                  
 
  Class-based abstraction layer for UI view control and data exchange with asynchronous requests coordination.

   Copyright (c) 2020 Caiuby Freitas 

   Version Spring'20 ECMAScript 6 compatible. 

   Release on MIT License
  
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    
 */


export const PATTERN_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const PATTERN_URL = /^(http)s?:\/\/(www|localhost)(.|\/)[a-z0-9-\.\/]+/;
const PATTERN_YMDHMS = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/gm;

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }


/**
  * Implements a trap routine to map key/value pairs 
  */
export class Enumerator {
    /**
     * Instantiate a Enumerator type
     * @param {object} obj containing a set of values i.e. {"String":1, "Number":2, "DateTime": 3, "Boolean":4}
     */
    constructor(obj){
        return new Proxy(obj, {
            get: function(obj, prop){
                return (prop in obj) ? obj[prop] : null;
            },
            set: function(obj, prop, value){
                obj[prop] = value;
                return true;
            },
            has: function(obj, prop){
                if (prop in obj) { //Usually the expect return is a number (index).
                    return obj[prop];
                };
                return Reflect.ownKeys(obj)[prop]; //but, if you're looking for the key it self...
            }
        });
    }; 
};

export const ViewControllerAction = new Enumerator ({
    "Create"    : 1,
    "Edit"      : 2,
    "Remove"    : 3,
    "Load"      : 4,
    "Custom"    : 5
});

export const DataFieldType = new Enumerator({"String":1, "Number":2, "DateTime": 3, "Boolean":4});

/**
 * Define an item type to be consumed by BaseItemList class
 */
export class BaseItem {
    #content;
    #parent;
    #contentType;
    /**
     * Create an instance of BaseItem class
     * @param {Object} obj representing any object to be stored
     */
    constructor(obj){
        this.#content = obj;
        this.#parent = Object.getPrototypeOf(this).constructor.name; //Get parent class of the object
        this.#contentType = Object.getPrototypeOf(this.#content).constructor.name; //Get parent class of the object content
    };
    /**
     * Change or retrieve the content of the object stored
     */
    set content(obj){
        this.#content = obj;
    };
    get content(){
        return this.#content;
    };
    /**
     * Return the type of the parent class.
     */
    get parent(){
        return this.#parent;
    };
    /**
     * Return the type of the object stored based on its parent class.
     */
    get contentType(){
        return this.#contentType;
    };
    /**
     * Implement a custom conversion method that will be automatically called by JSON.stringify 
     */
    toJSON(){
        return this.content
    };
};

/**
 * Define a list of BaseItem objects.
 */
export class BaseItemList {
    #length;
    #items;
    constructor(){
        this.#length = 0;
        this.#items = [];
    };
    /**
     * Return the total number of elements in the list
     */
    get length(){
        return this.#length;
    }
    set length(newValue){
        this.#length = newValue;
    };
    /**
     * Return an array with all elements (objects) stored in the list
     */
    get items(){
        return this.#items;
    };
    /**
     * Retrieve a copy of a specific element from the list
     * @param {number} index number from zero up to the total of items
     */
    item(index){
        if (index < 0 || index > this.length-1)
            throw new RangeError(`item index (${index}) is out of bounds.`);
        return this.items[index];
    };
    /**
     * Add an element of BaseItem type to the content of the list
     * @param {BaseItem} element 
     */
    push(obj){
        if (obj == null || !(obj instanceof BaseItem))
            throw new TypeError(`invalid parameter of ${obj.constructor.name} type. Instance of ${this.constructor.name} is required here.`);
        this.#items[this.length] = obj;
        this.#length++;
    };
    /**
     * Remove the last element from the list
     */
    pop(){
        if (this.length > 0){
            delete this.#items[--this.length];
        };
    };
    /**
     * Remove a specific element from the list
     * @param {number} index from zero up to the total of items in the stack
     */
    delete(index){
        if (index < 0 || index > this.length-1)
            throw new RangeError(`item index (${index}) is out of bounds.`);
        delete this.#items[index];
        this.#length--;
    };
    /**
     * Change the content of a specific element of the list
     * @param {number} index number from zero up to the total of items in the stack
     * @param {BaseItem} newValue new BaseItem type object to replace the current content
     */
    replace(index, obj){
        if (index < 0 || index > this.length-1)
            throw new RangeError(`item index (${index}) is out of bounds.`);
        if (obj == null || !(obj instanceof BaseItem))
            throw new TypeError(`invalid parameter of ${element.constructor.name} type. Instance of ${this.constructor.name} is required here.`);
        this.#items[index] = obj;
    };
    /**
     * Clean up the list
     */
    clear(){
        this.#items = [];
        this.#length = 0;
    };
    /**
     * Implement a custom conversion method that will be automatically called by JSON.stringify 
     */
    toJSON(){
        return this.items;
    };
};

/**
 * Data structure for Data fields. Meant to be used to instantiate DataRow object types.
 */
export class DataField {
    constructor(fieldName, fieldType, fieldValue, isRequired = false, onValidateCallback){
        this.fieldName =  fieldName;
        if (!(fieldType in DataFieldType))
            throw new TypeError(`invalid parameter value for field type. Require DataFieldType enumerator constants.`);
        this.fieldType = fieldType;
        this.fieldValue = fieldValue;
        this.isRequired = isRequired;
        this.onValidateCallback = onValidateCallback;
        this.onValidateCallback.bind(this);
    };
    validate(){
        return this.onValidateCallback();
    };
};

/**
 * Colletion for data fields that exposes a customizable validation method callback
 */
export class DataRow extends BaseItemList {
    #errorLog;
    #errorCount;
    getFields(){url
        return this.items;
    };
    push(...fields){
        if (fields == null || !(fields instanceof Array))
            throw new TypeError(`invalid parameter of ${obj.constructor.name} type. Instance of ${this.constructor.name} is required here.`);
        if (fields.length == 0)
            throw new Error(`at least one data field must be defined in order to instantiate a DataRow class.`);
        fields.forEach(function(value, _index){
            if (!(value instanceof DataField)) //check if all items are DataField instances
                throw new TypeError(`invalid instance of ${Object.getPrototypeOf(value).constructor.name} type. DataRow constructor accepts DataField instances only.`);
        });
        this.items[this.length] = fields;
        this.length++;
    };
    validate(callback){
        this.#errorLog = { count: 0, entries: {}};
        let result = callback();
        this.#errorLog.count = Object.entries(result).length;
        this.#errorLog.entries = result;
    };
    getErrors(){
        return this.#errorLog;
    };
};

/**
 * Defines a protocol structure to carry information from the BaseController to the recipient.
 */
export class Payload {
    #content;
    #requestor;
    /**
     * Create an instance of Payload type.
     * @param {object} requestor instance (references the class that instantiated the Payload).
     */
    constructor(requestor){
        this.#content = [];
        if (requestor == null || !(typeof requestor === "object"))
            throw new TypeError(`invalid parameter of type ${requestor.constructor.name}.`);
        this.#requestor = requestor.constructor.name;
    };
    set content(newValue){
        this.#content.push(newValue);
    };
    clearContent(){
        this.#content = [];
    };
    /**
     * Include a new content into the payload repeating the header information.
     * @param {object} obj to be embedded into the body.
     */
    addContent(obj){
        this.content = {
            header: {
                requestor: this.#requestor, //Requestor identified by the its class name.
                time: Date.now() //unformatted date and time.
            },
            body: obj
        };
    };
    toJSON(){
        return this.content;
    };
};

/**
 * Implement basic procedures to send and receive data using XMLHttpRequest. 
 * This class has no control over the meaning information in the payload, but just acts as a trasmitter / receiver. 
 * The onSuccess and onError event handlers must be implemented outside to deal with any result that comes back to the caller.
 */
class BaseController {
    #recipient;
    #sender;
    #payload;
    #onSuccessEventHandler;
    #onErrorEventHandler;
    constructor(){
        this.#recipient = null;
        this.#payload = null;
        this.#onSuccessEventHandler = null;
        this.#onErrorEventHandler = null;
    };
    /**
     * Payload is a object wrapper for the information to be sent. 
     * @param {object} object containing any predefined structure. 
     */
    set payload(newValue){
        if (!(newValue instanceof Payload) || newValue == null)
            throw new TypeError(`invalid parameter of ${newValue.constructor.name} type. Instance of Payload is required here`);
        this.#payload = newValue;
    };
    get payload(){
        return this.#payload;
    };
    /**
     * Recipient identifies the web address to the service that will read and process the payload. 
     * @param {string} URL of the recipient.
     */
    set recipient(newValue){
        if (newValue == null || !(typeof newValue === "string") || PATTERN_URL.test(newValue) == false)
            throw new TypeError(`invalid parameter for recipient: ${newValue}. A valid URL is required here.`);
        this.#recipient = newValue;
    };
    get recipient(){
        return this.#recipient;
    };
    /**
     * Sender identifies the web address from the origin of the request.
     * @param {string} URL of the sender.
     */
    set sender(newValue){
        if (newValue == null || !(typeof newValue === "string") || PATTERN_URL.test(newValue) == false)
            throw new TypeError(`invalid parameter for sender: ${newValue}. A valid URL is required here.`);
        this.#sender = newValue;
    };
    get sender(){
        return this.#sender;
    };
    /**
     * Event handler to be called when the execution is successful after the asynchronous request.
     * @param {function} name of the event handler.
     */
    set onSuccessEventHandler(newValue){
        this.#onSuccessEventHandler = (newValue != null && typeof newValue == "function") ? newValue : null;
    };
    get onSuccessEventHandler(){
        return this.#onSuccessEventHandler;
    };
    /**
     * Event handler to be called when an error occurs during or after the asychronous request.
     * @param {function} name of the event handler.
     */
    set onErrorEventHandler(newValue){
        this.#onErrorEventHandler = (newValue != null && typeof newValue == "function") ? newValue : null;
    };
    get onErrorEventHandler(){
        return this.#onErrorEventHandler;
    };
    /**
     * Send the payload out to the recipient via asynchronous request and wait for feedback.
     */
    execute(){
        if (this.recipient == null)
            throw new Error("no valid recipient url was provided to dispatch the payload.");
        if (this.payload == null)
            throw new Error("data package is empty.");
        (function(self){
            let promisse = new Promise((resolve, reject) => { //Promise structure here to make this callback more readable
                let request = null;
                if (window.XMLHttpRequest) //Check if browser supports XHR objects
                    request = new XMLHttpRequest();
                if (request == null)
                    throw new Error("This browser does not support asynchronous requests. Execution aborted.");
                request.open("POST", self.recipient);
                request.setRequestHeader("Content-type", "application/json");
                request.onreadystatechange = function(){
                    if (request.readyState == 4){ //Check for errors only after the fetch operation is complete
                        if (request.status == 200){
                            resolve({
                                sender: self.sender,
                                recipient: self.recipient,
                                sent: self.payload, 
                                received: request.responseText
                            });
                        }
                        else{
                            reject({
                                errorCode: request.status, 
                                errorMessage: request.responseText
                            });
                        };
                    };
                };
                request.send(JSON.stringify(self.payload)); 
            });
            promisse
                .then(resolve => { self.#onSuccessEventHandler(resolve) })
                .catch(reject => { self.#onErrorEventHandler(reject) })
        })(this);
    };
};

export const DataControllerStatus = new Enumerator({
    "Succeeded" : true,
    "Failed"    : false
});

/**
 * Exposes the BaseController allowing the aggregation of its features into an requestor class.
 */
export class DataController extends BaseController{
    #viewController;
    #requestor;
    constructor(requestor){
        super();
        super.onSuccessEventHandler = this.onSuccessEventHandler; //Redirect the event trigger to its local version.
        super.onErrorEventHandler = this.onErrorEventHandler;
        this.#requestor = requestor;
    };
    /**
     * Re-route the event handler to the overloaded method that will perform if the request was sucessful.
     * @param {object} response containing the payload and the result from processing.
     */
    onSuccessEventHandler(response){
        this.#requestor.onDataControllerCallbackEvent({
            status: DataControllerStatus.Succeeded,
            payload: response
        }); //Call the event defined by the requestor class passing execution status flag and the returned data package.
    };
    /**
     * Re-route the event handler to the overloaded method that will perform if the request failed.
     * @param {object} response containing the error code and an internal error message.
     */
    onErrorEventHandler(response){
        this.#requestor.onDataControllerCallbackEvent({
            status: DataControllerStatus.Failed,
            payload: response
        }); //Call the event defined by the requestor class passing execution status flag and the returned data package.
    };
    set view(newValue){
        this.#viewController = newValue;
        this.recipient = this.view.DOMContext.querySelector("form").getAttribute("action");
    };
    set payload(newValue){
        super.payload = newValue;
    };
    get payload(){
        return super.payload;
    };
    get view(){
        return this.#viewController;
    };
};

/**
 * Implements basic functionalities manages to control interactions between UI interface and the underlying data.
 */
class BaseViewController {
    #DOMContext;
    #classContext;
    constructor(DOMContext, classContext) {
        this.#DOMContext = DOMContext;
        this.#classContext = classContext;
    };
    get DOMContext(){
        return this.#DOMContext;
    };
    get classContext(){
        return this.#classContext;
    };
};

/**
 * Custom DOM-based button implementation to intercept click events according to ACTION attribute value.
 */
export class Button extends HTMLElement{
    connectedCallback(){
        this._action = this.getAttribute("action") || null; //immutable attribute (will not be observed)
    }
    /**
     * Assign a function to handle the button click event.
     */
    onClickHandler(eventHandler, classContext){
        this.addEventListener("click", function(e){ 
            e.preventDefault(); 
           // eventHandler(e, classContext); 
            eventHandler.apply(classContext, e); //without apply the class context will be passed as an additional argument. That way I can use 'this' inside the event handler.
        });
     };
};

export class Slider extends HTMLElement{
    static get observedAttributes(){
        return ["value", "backgroundcolor"];
    };
    set value(val){
        this.setAttribute("value", val);
    };
    get value(){
        return this.getAttribute("value");
    }
    set backgroundcolor(val){
        this.setAttribute("backgroundcolor", val);
    };
    get backgroundcolor(){
        return this.getAttribute("backgroundcolor");
    };
    connectedCallback(){
        this.innerHTML = '<div class="bg-overlay"></div><div class="thumb"></div>';       
        this.setColor(this.backgroundcolor);
        this.refreshSlider(this.value);
        document.addEventListener('mousemove', e => this.eventHandler(e));    
        document.addEventListener('mouseup', e => this.eventHandler(e));
        this.addEventListener('mousedown', e => this.eventHandler(e));    
    };
    attributeChangedCallback(name, oldVal, newVal){
        switch(name){
            case "value":
                this.refreshSlider(newVal);
                break;
            case "backgroundcolor":
                this.setColor(newVal);
                break;
        };
    };
    refreshSlider(value){
        if (this.querySelector('.thumb')) {
            this.querySelector('.thumb').style.left = (value/100 *
            this.offsetWidth - this.querySelector('.thumb').offsetWidth/2)
            + 'px';
        }        
    };
    setColor(color){
        if (this.querySelector('.bg-overlay')) {
            this.querySelector('.bg-overlay').style.background =
            `linear-gradient(to right, ${color} 0%, ${color}00 100%)`;
        }
    };
    eventHandler(e) {
        const bounds = this.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        switch (e.type) {
            case 'mousedown':
            this.isDragging = true;
            this.updateX(x);
            this.refreshSlider(this.value);
            break;
        case 'mouseup':
            this.isDragging = false;
            break;
        case 'mousemove':
            if (this.isDragging) {
                this.updateX(x);
                this.refreshSlider(this.value);
            }
            break;
        }
    }  
    updateX(x) {
        let hPos = x - this.querySelector('.thumb') .offsetWidth/2;
        if (hPos > this.offsetWidth) {
            hPos = this.offsetWidth;
        }
        if (hPos < 0) {
            hPos = 0;
        }
        this.value = (hPos / this.offsetWidth) * 100;
    }  
};

export class Carrousel extends HTMLElement{
    connectedCallback(){
        this._photoIndex = 0;
        this._photos = this.getAttribute("photos").split(",");
        this.innerHTML = '<h2>'+ this.getAttribute('title') + '</h2>' +
            '<h4>by '+ this.getAttribute('author') + '</h4>' +
            '<div class="image-container"></div>' +
            '<button class="back">&lt</button>' +
            '<button class="forward">&gt</button>';
        this.querySelector("button.back").addEventListener("click", e => this.onBackButtonClick(e));
        this.querySelector("button.forward").addEventListener("click", e => this.onForwardButtonClick(e));
        this.showPhoto();
    };
    onBackButtonClick(e){
        this._photoIndex --;
        if (this._photoIndex < 0)
            this._photoIndex = this._photos.length-1;
        this.showPhoto();
    }
    onForwardButtonClick(e){
        this._photoIndex ++;
        if (this._photoIndex >= this._photos.length)
            this._photoIndex = 0;
        this.showPhoto();
    }
    showPhoto(){
        this.querySelector(".image-container").style.backgroundImage = "url(" + this._photos[this._photoIndex] + ")";
    }
};

/**
 * Exposes the BaseViewController allowing the aggregation of its features into an application.
 */
export class ViewController extends BaseViewController {
    constructor(DOMContext, classContext) {
        super(DOMContext, classContext);
    };
    /**
     * Assign an internal event handler to a DOM element.
     * @param {*} filter querySelector filter to find all DOM elements that can trigger the event handler.
     * @param {*} eventHandler that will respond when the element is clicked.
     */
    setTrigger(filter, eventHandler){
        let classContext = super.classContext;
        super.DOMContext.querySelectorAll(filter).forEach(function(item, index){
            item.addEventListener("click", function(e) {
                e.preventDefault();
                classContext[eventHandler](e); 
            });
        });
     };    
};
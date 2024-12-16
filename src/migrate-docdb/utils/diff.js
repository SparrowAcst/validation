const { keys, isArray, last, first, get, isDate, isString } = require("lodash")

const jsondiffpatch = require('jsondiffpatch')

const customTrivialFilter = context => {

    if (context.left === context.right) {
        context.setResult(undefined).exit();
        return;
    }

    if (typeof context.left === 'undefined') {
        if (typeof context.right === 'function') {
            throw new Error('functions are not supported');
        }
        context.setResult([context.right]).exit();
        return;
    }

    if (typeof context.right === 'undefined') {
        context.setResult([context.left, 0, 0]).exit();
        return;
    }

    if (
        typeof context.left === 'function' ||
        typeof context.right === 'function'
    ) {
        throw new Error('functions are not supported');
    }

    context.leftType = context.left === null ? 'null' : typeof context.left;
    context.rightType = context.right === null ? 'null' : typeof context.right;

    if(isDate(context.left) || isDate(context.right)){
      return  
    }
    
    if (context.leftType !== context.rightType) {
        context.setResult([context.left, context.right]).exit();
        return;
    }

    if (context.leftType === 'boolean' || context.leftType === 'number') {
        context.setResult([context.left, context.right]).exit();
        return;
    }

    if (context.leftType === 'object') {
        context.leftIsArray = Array.isArray(context.left);
    }

    if (context.rightType === 'object') {
        context.rightIsArray = Array.isArray(context.right);
    }

    if (context.leftIsArray !== context.rightIsArray) {
        context.setResult([context.left, context.right]).exit();
        return;
    }

    if (context.left instanceof RegExp) {
        if (context.right instanceof RegExp) {
            context
                .setResult([context.left.toString(), context.right.toString()])
                .exit();
        } else {
            context.setResult([context.left, context.right]).exit();
        }
    }

}

customTrivialFilter.filterName = 'custom-trivial';



const customDateFilter = context => {

    if (isDate(context.left) && isDate(context.right)) {
        
        if ( Math.abs(context.left.getTime() - context.right.getTime()) > 1000 ) {
            context.setResult([context.left, context.right]).exit()

        } else {

            context.setResult(undefined).exit()

        }

        return

    }

    if (
        (isString(context.left) && isDate(context.right)) ||
        (isDate(context.left) && isString(context.right))
    ) {

        
        let left = new Date(context.left)
        let right = new Date(context.right)

        // console.log(left, right)

        if (left.toString() !== "Invalid Date" && right.toString() !== "Invalid Date") {
            

            if ( Math.abs(left.getTime() - right.getTime()) > 1000 ) {

                context.setResult([context.left, context.right]).exit()

            } else {

                context.setResult(undefined).exit()

            }

            return

        }

        context.setResult([context.left, context.right]).exit()

        return

    }

}

customDateFilter.filterName = 'custom-dates'


const format = (delta, parentKey) => {
    let res = []
    delta = jsondiffpatch.clone(delta)

    keys(delta).forEach(key => {

        if (key == "_t") return

        let publicParentKey = parentKey || ""
        let publicSelfKey = key //(keys(delta).includes("_t")) ? "" : key

        let publicKey = [publicParentKey, publicSelfKey].filter(d => d).join(".")

        if (isArray(delta[key])) {
            let op
            if (delta[key].length == 1) op = "insert"
            if (delta[key].length == 2) op = "update"
            if (delta[key].length == 3 && last(delta[key]) == 0) op = "remove"

            let oldValue
            if (delta[key].length == 1) oldValue = undefined
            if (delta[key].length == 2) oldValue = first(delta[key])
            if (delta[key].length == 3 && last(delta[key]) == 0) oldValue = first(delta[key])

            let newValue
            if (delta[key].length == 1) newValue = last(delta[key])
            if (delta[key].length == 2) newValue = last(delta[key])
            if (delta[key].length == 3 && last(delta[key]) == 0) newValue = undefined

            res.push({
                key: publicKey,
                op,
                oldValue,
                newValue
            })

        } else {

            res = res.concat(format(delta[key], publicKey))

        }

    })

    return res
}

let Diff = jsondiffpatch.create({
    objectHash: (d, index) => d.name || d.id || JSON.stringify(d) || index,
})

Diff.processor.pipes.diff.replace('trivial', customTrivialFilter)
Diff.processor.pipes.diff.replace('dates', customDateFilter)

customDiff = {

    delta: (left, right, ...selectors) => {

        let res = {}
        selectors.forEach(selector => {
            res[selector] = Diff.diff(get(left, selector), get(right, selector))
        })
        return res

    },

    format: delta => {

        let res = {}
        keys(delta).forEach(key => {
            res[key] = format(delta[key])
        })
        return res

    }

}

module.exports = customDiff
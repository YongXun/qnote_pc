
const reducer = ( state , action ) => {
    switch( action.type ){
        case 'changColor':
            return Object.assign({},state,action)
        default:
            return state;
    }
}

module.exports = {
    reducer
}
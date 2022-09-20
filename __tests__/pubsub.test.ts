import pubsub from '../src/libs/pubsub'

describe('Testing pubsub library', (): void => {   
    it('Should react on publication of custom event', () => {      
        console.log = jest.fn();
        expect(console.log).toHaveBeenCalledTimes(0);
        pubsub.on('test event', (data: string | Object | null) => console.log(`test reaction data: ${data}`));
        pubsub.emit('test event', 'test');

        expect(console.log).toHaveBeenCalledWith('test reaction data: test');
    });

    it('Should save all callbacks for the event', () => {
        console.log = jest.fn();
        pubsub.on('test event', (data: string | Object | null) => console.log(`oh no: ${data}`));
        pubsub.on('test event', (data: string | Object | null) => console.log(`sotop it: ${data}`));
        pubsub.on('test event', (data: string | Object | null) => console.log(`please: ${data}`));
        
        //there is gonna be 4 besides 3 called times becouse of one callback from the previous unit
        pubsub.emit('test event', 'here we go again');
        expect(console.log).toHaveBeenCalledTimes(4);
    })
});
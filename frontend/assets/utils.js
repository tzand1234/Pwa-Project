import { notifications } from "../components/notification/notifications.js";
import { writable } from 'svelte/store';

export async function api(endpoint, data, method) {
    try {
        const requestOptions = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (method === 'POST' || method === 'PUT') {

            console.log(data);
            requestOptions.body = JSON.stringify(data);
        }
        const url = `${endpoint}`;
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            const errorData = await response.json();
            
            notifications.warning(errorData.error, 3000)
            
            throw new Error(errorData.error || 'Failed to perform request');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export function clickOutside(node) {
    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('click_outside'));
        }
    };

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
}

function getInitialState() {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
}

export const User = (function () {
  const { subscribe, set } = writable(getInitialState());

  return {
    subscribe,

    signout: () => {
      localStorage.removeItem('user');
      set(null);
    },

    signin: (username) => {
      const user = { username };
      localStorage.setItem('user', JSON.stringify(user));
      set(user);
    }
  };
})();
  
function createComponentStore() {
    const { subscribe, set, update } = writable({
        selectedIndex: 0,
        navOptions: []
    });

    return {
        subscribe,
        setNavOptions: (options) => update(store => {
            store.navOptions = options;
            return store;
        }),
        changeComponent: (index) => update(store => {
            store.selectedIndex = index;
            return store;
        })
    };
}

function createSliderStore() {
    const { subscribe, set, update } = writable({
        isSliderOpen: false
    });

    return {
        subscribe,
        toggleSlider: () => update(store => {
            store.isSliderOpen = !store.isSliderOpen;
            return store;
        }),
        closeSlider: () => update(store => {
            store.isSliderOpen = false;
            return store;
        })
    };
}

export const sliderStore = createSliderStore();
export const componentStore = createComponentStore();

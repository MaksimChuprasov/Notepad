import React, { useRef } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Note from './Note';

const ITEM_HEIGHT = 210;

const SwipeableNote = ({ note, onPress, onLongPress, isSelected, onSwipe, scrollRef }) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const height = useSharedValue(ITEM_HEIGHT);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.isSwiping = undefined;
        },
        onActive: (event, ctx) => {
            const dx = event.translationX;
            const dy = event.translationY;

            if (ctx.isSwiping === undefined) {
                if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) + 5) {
                    ctx.isSwiping = true;
                } else if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) + 5) {
                    ctx.isSwiping = false;
                }
            }

            if (ctx.isSwiping) {
                translateX.value = dx;
            }
        },
        onEnd: (event, ctx) => {
            if (ctx.isSwiping) {
                if (Math.abs(event.translationX) > 120) {
                    translateX.value = withTiming(Math.sign(event.translationX) * 500);
                    opacity.value = withTiming(0);
                    height.value = withTiming(0, {}, () => {
                        runOnJS(onSwipe)(note.id);
                    });
                } else {
                    translateX.value = withTiming(0);
                }
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
        height: height.value,
        marginVertical: 0,
    }));

    return (
        <PanGestureHandler
            onGestureEvent={gestureHandler}
            simultaneousHandlers={scrollRef?.current ? [scrollRef.current] : undefined}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-5, 5]}
        >
            <Animated.View style={animatedStyle}>
                <Note
                    note={note}
                    isSelected={isSelected}
                    onPress={onPress}
                    onLongPress={onLongPress}
                />
            </Animated.View>
        </PanGestureHandler>
    );
};

export default SwipeableNote;

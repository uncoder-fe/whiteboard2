//! A Simple Hello World Crate

// 常量和分配后的值不得改变
const PI: f64 = 3.14159265359; // 通常，将常量和静态变量放在函数外部的代码文件的顶部

// 普通函数
fn sum(a: i32, b: i32) -> i32 {
    return a + b;
}

// 匿名函数或lambda函数
fn sum2(i: i32) -> i32 {
    i * i
}

fn main() {
    // 打印
    println!("Hello, world!"); // 字符串
    println!("{:?}", [1, 2, 3]); // 数字数组
    println!("{:#?}", ['我', '谁', '是']); // 字符串数组

    println!("π 的值是 {}", PI); // 常量

    // 变量
    let a; // 无类型
    a = 5;
    let b: i8; // 8位整型
    b = 5;
    let t = true; // 布尔类型
    let f: bool = false;
    println!("a：{}，b：{}，t：{}，f：{}", a, b, t, f);

    // 可变变量
    let mut e = 5;
    e = e + 6;
    println!("e：{}", e);

    // 元组
    let xy: (char, i32) = ('嘿', 2);
    let (x, y) = xy;
    let z = {
        //
        let x = 1;
        let y = 2;
        x + y
    };
    println!("x：{}，y：{}，z：{}", x, y, z);

    // 影子，同一个变量名，不同类型可以同时赋值
    let x: f64 = -20.48; // 浮点型（负数）
    let x: i32 = x.floor() as i32; // 浮点型转换成整型，向下取整
    println!("{}", x); // -21
    let s: &str = "hello"; // 引用类型（字符串）
    let s: String = s.to_uppercase(); // 转大写字符串
    println!("{}", s); // HELLO

    println!("普通函数：{}", sum(a, y));

    let p1 = sum;
    let x = p1(5, 8);
    println!("函数指针：{}", x);

    println!("匿名函数：{}", sum2(2));

    let square = |i: i32| -> i32 { i * i };
    println!("匿名函数调用：{}", square(2));
}

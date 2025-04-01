//
//  ContentView.swift
//  Me Adota
//
//  Created by Anderson Sprenger on 01/04/25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Tab("Home", systemImage: "house") {
                HomeView()
            }
            
            Tab("Meus Pets", systemImage: "pawprint.fill") {
                Text("Meus Pets")
            }
            
            Tab("Adoções", systemImage: "heart.fill") {
                Text("Adoções")
            }
            
            Tab("Monitoria", systemImage: "eye") {
                Text("Monitoria")
            }
            
            Tab("Perfil", systemImage: "person.circle") {
                Text("Perfil")
            }
        }
    }
}

#Preview {
    ContentView()
}
